from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import SimulationInputSerializer


def _memory_adjusted(current, history_by_step, step, depth, weight):
    lower_bound = max(0, step - depth + 1)
    samples = history_by_step[lower_bound : step + 1]
    averaged = [sum(values) / len(samples) for values in zip(*samples)]
    return [
        (1.0 - weight) * current_value + weight * avg_value
        for current_value, avg_value in zip(current, averaged)
    ]


def simulate_population(data):
    initial = data['initial_population']
    fertility = data['fertility']
    survival = data['survival']
    memory_weight = data['memory_weight']
    memory_depth = data['memory_depth']
    steps = data['steps']

    history = [initial]

    for step in range(steps):
        current = history[-1]
        effective = _memory_adjusted(
            current=current,
            history_by_step=history,
            step=step,
            depth=memory_depth,
            weight=memory_weight,
        )
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


class SimulationView(APIView):
    def post(self, request):
        serializer = SimulationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = simulate_population(serializer.validated_data)
        return Response(result, status=status.HTTP_200_OK)
