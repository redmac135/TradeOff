export function calculateInterpolatedValue(
  initialValue,
  finalValue, 
  totalGameTime,
  currentGameTime
) {
  // Linear interpolation between initial and final value
  const progress = currentGameTime / totalGameTime;
  const interpolatedValue = initialValue + (finalValue - initialValue) * progress;
  
  // Add some random noise to make it more realistic
  const noise = (Math.random() - 0.5) * (finalValue - initialValue) * 0.001;
  
  return interpolatedValue + noise;
}