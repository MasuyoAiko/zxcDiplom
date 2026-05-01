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

        return attrs
