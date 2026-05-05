from rest_framework import serializers


class SimulationInputSerializer(serializers.Serializer):
    initial_population = serializers.ListField(
        child=serializers.FloatField(min_value=0.0),
        min_length=2,
    )
    fertility = serializers.ListField(
        child=serializers.FloatField(min_value=0.0),
        min_length=2,
    )
    survival = serializers.ListField(
        child=serializers.FloatField(min_value=0.0, max_value=1.0),
        min_length=1,
    )
    memory_weight = serializers.FloatField(min_value=0.0, max_value=1.0)
    memory_depth = serializers.IntegerField(min_value=1, max_value=200)
    steps = serializers.IntegerField(min_value=1, max_value=500)
    memory_kernel = serializers.ChoiceField(
        choices=['rectangular', 'exponential', 'lag'],
        default='rectangular',
    )
    memory_gamma = serializers.FloatField(min_value=0.01, max_value=15.0, default=0.6)
    memory_lag = serializers.IntegerField(min_value=1, max_value=200, default=2)
    include_classic_comparison = serializers.BooleanField(default=False)

    def validate(self, attrs):
        groups = len(attrs['initial_population'])

        if len(attrs['fertility']) != groups:
            raise serializers.ValidationError(
                {'fertility': 'Length must be equal to initial_population length.'}
            )

        if len(attrs['survival']) != groups - 1:
            raise serializers.ValidationError(
                {'survival': 'Length must be initial_population length - 1.'}
            )

        steps = attrs['steps']
        if attrs['memory_depth'] > steps:
            raise serializers.ValidationError(
                {'memory_depth': 'Глубина памяти не может быть больше числа шагов моделирования.'}
            )

        if attrs['memory_lag'] > steps:
            raise serializers.ValidationError(
                {'memory_lag': 'Запаздывание не может быть больше числа шагов моделирования.'}
            )

        return attrs
