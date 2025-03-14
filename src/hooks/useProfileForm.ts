
import { useProfileFormState } from './profile/useProfileFormState';
import { usePeriodData } from './profile/usePeriodData';

export const useProfileForm = () => {
  const {
    formData,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleNumberChange,
    handleSubmit
  } = useProfileFormState();

  const { currentPeriod, currentAvgWeightLoss } = usePeriodData();

  return {
    formData,
    isLoading,
    currentPeriod,
    currentAvgWeightLoss,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleNumberChange,
    handleSubmit
  };
};
