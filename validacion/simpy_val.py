# Validacion con software independiente (SimPy) — motor de eventos discretos.
# Reconstruye los modelos del simulador (simple M/M/c, multietapa en tandem y
# con decision) y reporta Wq (espera en cola), W (tiempo en sistema) y la
# utilizacion promedio, con 25 replicas e intervalo de confianza al 95%.
#
# Requiere:  pip install simpy
# Ejecutar:  python3 simpy_val.py

import simpy, random, math


def stats(xs):
    n = len(xs)
    m = sum(xs) / n
    sd = (sum((x - m) ** 2 for x in xs) / (n - 1)) ** 0.5 if n > 1 else 0
    return m, 1.96 * sd / math.sqrt(n)  # media, semi-ancho del IC 95%


# ---------- Proceso simple (M/M/c) ----------
def sim_simple(ia, s, c, H, seed):
    random.seed(seed)
    env = simpy.Environment()
    srv = simpy.Resource(env, capacity=c)
    waits, systs, busy = [], [], [0.0]

    def cust(arr):
        with srv.request() as r:
            yield r
            start = env.now
            yield env.timeout(random.expovariate(1 / s))
            end = env.now
            busy[0] += max(0, min(end, H) - min(start, H))
            if end <= H:
                waits.append(start - arr)
                systs.append(end - arr)

    def src():
        t = 0
        while True:
            t += random.expovariate(1 / ia)
            if t > H:
                break
            yield env.timeout(t - env.now)
            env.process(cust(env.now))

    env.process(src())
    env.run()
    return (sum(waits) / len(waits), sum(systs) / len(systs), busy[0] / (c * H) * 100)


# ---------- Multietapa (colas en tandem) ----------
def sim_multi(ia, services, resources, H, seed):
    random.seed(seed)
    env = simpy.Environment()
    res = [simpy.Resource(env, capacity=resources[i]) for i in range(len(services))]
    busy = [0.0] * len(services)
    waits, systs = [], []

    def cust(arr):
        tw = 0
        for i in range(len(services)):
            a = env.now
            with res[i].request() as r:
                yield r
                start = env.now
                tw += start - a
                yield env.timeout(random.expovariate(1 / services[i]))
                end = env.now
                busy[i] += max(0, min(end, H) - min(start, H))
        if env.now <= H:
            waits.append(tw)
            systs.append(env.now - arr)

    def src():
        t = 0
        while True:
            t += random.expovariate(1 / ia)
            if t > H:
                break
            yield env.timeout(t - env.now)
            env.process(cust(env.now))

    env.process(src())
    env.run()
    utils = [busy[i] / (resources[i] * H) * 100 for i in range(len(services))]
    return (sum(waits) / len(waits), sum(systs) / len(systs), sum(utils) / len(utils))


# ---------- Con decision (compuerta que reparte en 2 rutas) ----------
def sim_dec(ia, rec, repA, repB, pay, pA, H, seed):
    random.seed(seed)
    env = simpy.Environment()
    Rrec = simpy.Resource(env, capacity=rec[1])
    RA = simpy.Resource(env, capacity=repA[1])
    RB = simpy.Resource(env, capacity=repB[1])
    Rpay = simpy.Resource(env, capacity=pay[1])
    busy = {"rec": 0.0, "A": 0.0, "B": 0.0, "pay": 0.0}
    waits, systs = [], []

    def serve(resObj, mean, key, tw_ref):
        a = env.now
        with resObj.request() as r:
            yield r
            start = env.now
            tw_ref[0] += start - a
            yield env.timeout(random.expovariate(1 / mean))
            end = env.now
            busy[key] += max(0, min(end, H) - min(start, H))

    def cust(arr):
        tw = [0.0]
        yield from serve(Rrec, rec[0], "rec", tw)
        if random.random() * 100 < pA:
            yield from serve(RA, repA[0], "A", tw)
        else:
            yield from serve(RB, repB[0], "B", tw)
        yield from serve(Rpay, pay[0], "pay", tw)
        if env.now <= H:
            waits.append(tw[0])
            systs.append(env.now - arr)

    def src():
        t = 0
        while True:
            t += random.expovariate(1 / ia)
            if t > H:
                break
            yield env.timeout(t - env.now)
            env.process(cust(env.now))

    env.process(src())
    env.run()
    utils = [
        busy["rec"] / (rec[1] * H) * 100,
        busy["A"] / (repA[1] * H) * 100,
        busy["B"] / (repB[1] * H) * 100,
        busy["pay"] / (pay[1] * H) * 100,
    ]
    return (sum(waits) / len(waits), sum(systs) / len(systs), sum(utils) / len(utils))


def rep(fn, args, reps=25):
    W, S, U = [], [], []
    for r in range(reps):
        w, s, u = fn(*args, 4000 + r * 131)
        W.append(w); S.append(s); U.append(u)
    return stats(W), stats(S), stats(U)


if __name__ == "__main__":
    H = 100000
    fmt = lambda t: f"{t[0]:.2f} ± {t[1]:.2f}"
    for name, res in [
        ("SIMPLE M/M/1", rep(sim_simple, (10, 7, 1, H))),
        ("SIMPLE M/M/2", rep(sim_simple, (5, 8, 2, H))),
        ("MULTIETAPA", rep(sim_multi, (10, [5, 7, 6], [1, 2, 1], H))),
        ("CON DECISION", rep(sim_dec, (10, (5, 1), (8, 1), (15, 2), (4, 1), 60, H))),
    ]:
        wq, w, u = res
        print(f"{name:14} | Wq {fmt(wq)} | W {fmt(w)} | Util {fmt(u)}")
