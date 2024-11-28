import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  addScheduledPin, 
  updateScheduledPin, 
  removeScheduledPin 
} from '../store/slices/schedulerSlice';
import { validatePinData } from '../utils/validation';
import { isValidScheduleTime } from '../utils/date';
import toast from 'react-hot-toast';

export function useScheduledPins() {
  const dispatch = useDispatch();
  const { scheduledPins } = useSelector((state: RootState) => state.scheduler);

  const schedulePin = useCallback(async (pinData: any) => {
    const errors = validatePinData(pinData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    const scheduledTime = new Date(pinData.scheduledTime);
    if (!isValidScheduleTime(scheduledTime)) {
      toast.error('Scheduled time must be at least 5 minutes in the future');
      return false;
    }

    try {
      // Handle image URL
      let imageUrl = pinData.imageUrl;
      
      // If we have a file or preview, use it
      if (pinData.imageFile) {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pinData.imageFile);
        });
      } else if (pinData.imagePreview) {
        imageUrl = pinData.imagePreview;
      }

      if (!imageUrl) {
        toast.error('Image is required');
        return false;
      }

      const newPin = {
        id: Date.now().toString(),
        title: pinData.title,
        description: pinData.description,
        link: pinData.link,
        imageUrl,
        boardId: pinData.boardId,
        scheduledTime: pinData.scheduledTime,
        status: 'scheduled' as const
      };

      dispatch(addScheduledPin(newPin));
      return true;
    } catch (error) {
      console.error('Schedule pin error:', error);
      toast.error('Failed to schedule pin');
      return false;
    }
  }, [dispatch]);

  const scheduleBulkPins = useCallback(async (pins: any[]) => {
    let scheduledCount = 0;

    for (const pin of pins) {
      const success = await schedulePin({
        ...pin,
        imageUrl: pin.imageUrl, // Use the URL directly from CSV
        boardId: pin.boardId
      });
      if (success) scheduledCount++;
    }

    return scheduledCount;
  }, [schedulePin]);

  const updatePin = useCallback((pinId: string, updates: Partial<any>) => {
    const pin = scheduledPins.find(p => p.id === pinId);
    if (pin) {
      dispatch(updateScheduledPin({ ...pin, ...updates }));
    }
  }, [dispatch, scheduledPins]);

  const deletePin = useCallback((pinId: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled pin?')) {
      dispatch(removeScheduledPin(pinId));
      toast.success('Pin deleted successfully');
    }
  }, [dispatch]);

  return {
    scheduledPins,
    schedulePin,
    scheduleBulkPins,
    updatePin,
    deletePin
  };
}