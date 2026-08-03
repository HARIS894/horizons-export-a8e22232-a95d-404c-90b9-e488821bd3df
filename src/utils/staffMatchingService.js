import { getStaffList } from './staffUtils';
import { serviceablePincodes } from '@/config/pincodeConfig';

// Helper to calculate distance (simplified)
const getDistance = (pincode1, pincode2) => {
  // In a real app, use Google Distance Matrix API
  // Here we use a very rough heuristic based on our config or just mock it
  if (pincode1 === pincode2) return 2; // 2 km
  return Math.floor(Math.random() * 15) + 3; // Random 3-18 km
};

export const getMatchingStaff = async (patientPincode, serviceType, shiftType) => {
  const allStaff = await getStaffList();

  // Filter basic requirements
  const eligibleStaff = allStaff.filter(staff => {
    const isVerified = staff.verification_status === 'verified';
    const isAvailable = staff.current_status === 'Available';
    const hasService = staff.service_types.some(t => 
      serviceType.toLowerCase().includes(t.toLowerCase()) ||
      t.toLowerCase().includes(serviceType.toLowerCase())
    );
    const hasShift = staff.available_shifts.includes(shiftType);
    const coversPincode = staff.pincode_coverage.includes(patientPincode);

    return isVerified && isAvailable && hasService && hasShift && coversPincode;
  });

  // Calculate scores and metrics
  const scoredStaff = eligibleStaff.map(staff => {
    const distance = getDistance(patientPincode, staff.pincode_coverage[0]); // Mock distance
    const arrivalTime = Math.round(distance * 3 + 15); // Rough est: 3 min/km + 15 min buffer
    
    // Scoring Algorithm (0-100)
    // Distance weight: 40%, Rating weight: 30%, Experience weight: 30%
    const distanceScore = Math.max(0, 40 - distance); 
    const ratingScore = (staff.rating / 5) * 30;
    const expScore = Math.min(30, staff.experience_years * 3);
    
    const totalScore = distanceScore + ratingScore + expScore;

    return {
      ...staff,
      matchMetrics: {
        distanceKm: distance,
        arrivalMinutes: arrivalTime,
        score: totalScore
      }
    };
  });

  // Sort by score descending
  return scoredStaff.sort((a, b) => b.matchMetrics.score - a.matchMetrics.score).slice(0, 5);
};