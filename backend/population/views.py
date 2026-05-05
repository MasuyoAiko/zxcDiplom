import math

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import SimulationInputSerializer


def _weighted_average_vectors(samples, weights):
    if not samples:
        return None
    group_count = len(samples[0])
    length = len(samples)
    out = []
    for vi in range(group_count):
        out.append(sum(samples[t][vi] * weights[t] for t in range(length)))
    return out


def _memory_adjusted(current, history_by_step, step, data):
    weight = data['memory_weight']
    if weight <= 0:
        return list(current)

    depth = data['memory_depth']
    kernel = data['memory_kernel']
    gamma = float(data['memory_gamma'])
    lag_steps = int(data['memory_lag'])

    lower_bound = max(0, step - depth + 1)
    samples = history_by_step[lower_bound : step + 1]
    length = len(samples)

    if kernel == 'lag':
        idx = max(0, step - lag_steps)
        averaged = list(history_by_step[idx])
    elif kernel == 'exponential':
        weights = []
        for t in range(length):
            age_in_window = length - 1 - t
            weights.append(math.exp(-gamma * age_in_window))
        s = sum(weights)
        weights = [w / s for w in weights]
        averaged = _weighted_average_vectors(samples, weights)
    else:
        averaged = [sum(values) / length for values in zip(*samples)]

    return [
        (1.0 - weight) * current_value + weight * avg_value
        for current_value, avg_value in zip(current, averaged)
    ]


def _run_simulation(data):
    initial = data['initial_population']
    fertility = data['fertility']
    survival = data['survival']
    steps = data['steps']

    history = [initial]

    for step in range(steps):
        current = history[-1]
        effective = _memory_adjusted(current, history, step, data)
        next_population = [0.0] * len(current)
        next_population[0] = sum(
            fertility_value * group_value
            for fertility_value, group_value in zip(fertility, effective)
        )

        for group_idx in range(1, len(current)):
            next_population[group_idx] = (
                survival[group_idx - 1] * effective[group_idx - 1]
            )

        history.append(next_population)

    totals = [sum(step_values) for step_values in history]
    time_series = [
        {
            'step': idx,
            'total': totals[idx],
            'ages': values,
        }
        for idx, values in enumerate(history)
    ]
    return {
        'time_series': time_series,
        'final_population': history[-1],
        'totals': totals,
    }


def simulate_population(data):
    result = _run_simulation(data)
    if data.get('include_classic_comparison') and data['memory_weight'] > 0:
        classic_data = dict(data)
        classic_data['memory_weight'] = 0.0
        classic = _run_simulation(classic_data)
        result['classic_time_series'] = classic['time_series']
        result['classic_totals'] = classic['totals']
    return result


class SimulationView(APIView):
    def post(self, request):
        serializer = SimulationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = simulate_population(serializer.validated_data)
        return Response(result, status=status.HTTP_200_OK)
