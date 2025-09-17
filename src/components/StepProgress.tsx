import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepProgressProps {
  currentStep: number;
  completedSteps: number[];
  maxVisibleSteps?: number; // Máximo de pasos a mostrar (opcional)
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  completedSteps,
  maxVisibleSteps = 10,
}) => {
  const totalSteps = Math.max(currentStep, completedSteps.length + 1);
  const visibleSteps = Math.min(totalSteps, maxVisibleSteps);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Progreso</Text>
      <View style={styles.stepsContainer}>
        {Array.from({ length: visibleSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          
          return (
            <View key={stepNumber} style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isCurrent && styles.stepCurrent,
                  isUpcoming && styles.stepUpcoming,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    isCompleted && styles.stepNumberCompleted,
                    isCurrent && styles.stepNumberCurrent,
                    isUpcoming && styles.stepNumberUpcoming,
                  ]}
                >
                  {isCompleted ? '✓' : stepNumber}
                </Text>
              </View>
              {index < visibleSteps - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted,
                    isUpcoming && styles.stepLineUpcoming,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.progressText}>
        {completedSteps.length} pasos completados
        {totalSteps > maxVisibleSteps && ` (mostrando últimos ${maxVisibleSteps})`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepCurrent: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  stepUpcoming: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepNumberCompleted: {
    color: '#FFFFFF',
  },
  stepNumberCurrent: {
    color: '#FFFFFF',
  },
  stepNumberUpcoming: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepLineUpcoming: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
