import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Download, AlertCircle, Loader, Calendar, Clock } from 'lucide-react';
import { useScheduledPins } from '../../hooks/useScheduledPins';
import { useBoards } from '../../hooks/useBoards';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import toast from 'react-hot-toast';

interface CSVPin {
  title: string;
  description: string;
  link?: string;
  imageUrl: string;
}

interface SchedulePreview {
  pin: CSVPin;
  scheduledTime: string;
  boardId: string;
}

export function BulkUploadForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pinsPerDay, setPinsPerDay] = useState(5);
  const [schedulePreview, setSchedulePreview] = useState<SchedulePreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { scheduleBulkPins } = useScheduledPins();
  const { boards } = useBoards();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsProcessing(true);
      try {
        const text = await file.text();
        const pins = parseCSV(text);
        
        if (pins.length === 0) {
          throw new Error('No valid pins found in CSV file');
        }

        const preview = generateSchedule(pins);
        setSchedulePreview(preview);
        setShowPreview(true);
      } catch (error) {
        console.error('CSV processing error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to process CSV file');
      } finally {
        setIsProcessing(false);
      }
    }
  });

  const parseCSV = (csv: string): CSVPin[] => {
    // Split by newline and filter out empty lines
    const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    // Parse headers and convert to lowercase
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Validate required headers
    const requiredHeaders = ['title', 'description', 'imageurl'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const pins: CSVPin[] = [];
    
    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      // Skip rows with incorrect number of columns
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: incorrect number of columns`);
        continue;
      }

      // Create pin object from row data
      const pin: Record<string, string> = {};
      headers.forEach((header, index) => {
        pin[header] = values[index];
      });

      // Validate required fields
      if (!pin.title || !pin.description || !pin.imageurl) {
        console.warn(`Skipping row ${i + 1}: missing required fields`);
        continue;
      }

      // Add valid pin to array
      pins.push({
        title: pin.title,
        description: pin.description,
        imageUrl: pin.imageurl,
        link: pin.link
      });
    }

    return pins;
  };

  const generateSchedule = (pins: CSVPin[]): SchedulePreview[] => {
    if (!boards.length) {
      throw new Error('No boards available. Please make sure you have at least one board.');
    }

    const schedule: SchedulePreview[] = [];
    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 1, 0, 0, 0); // Start from next hour

    // Calculate posting times
    const postsPerDay = Math.min(15, Math.max(1, pinsPerDay));
    const totalDays = Math.ceil(pins.length / postsPerDay);
    const hoursInterval = Math.floor(12 / postsPerDay); // Spread over 12 hours

    pins.forEach((pin, index) => {
      const dayIndex = Math.floor(index / postsPerDay);
      const pinIndexInDay = index % postsPerDay;
      
      const postDate = addDays(startDate, dayIndex);
      const postHour = 9 + (pinIndexInDay * hoursInterval); // Start at 9 AM
      const postMinute = Math.floor(Math.random() * 60); // Random minute

      const scheduledTime = setMinutes(setHours(postDate, postHour), postMinute);
      const randomBoardIndex = Math.floor(Math.random() * boards.length);

      schedule.push({
        pin,
        scheduledTime: scheduledTime.toISOString(),
        boardId: boards[randomBoardIndex].id
      });
    });

    return schedule;
  };

  const handleSchedule = async () => {
    setIsProcessing(true);
    try {
      const pinsToSchedule = schedulePreview.map(item => ({
        ...item.pin,
        boardId: item.boardId,
        scheduledTime: item.scheduledTime
      }));

      const scheduled = await scheduleBulkPins(pinsToSchedule);
      toast.success(`Successfully scheduled ${scheduled} pins`);
      setShowPreview(false);
      setSchedulePreview([]);
    } catch (error) {
      console.error('Scheduling error:', error);
      toast.error('Failed to schedule pins');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['title', 'description', 'imageUrl', 'link'];
    const csv = [
      headers.join(','),
      'Example Pin Title,A great description of the pin,https://example.com/image.jpg,https://example.com'
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pinterest-pins-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!showPreview && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">CSV Format Requirements</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your CSV file must include the following columns:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>title (required)</li>
                    <li>description (required)</li>
                    <li>imageUrl (required) - must be a valid image URL</li>
                    <li>link (optional)</li>
                  </ul>
                  <p className="mt-2 italic">Note: Column names are case-insensitive</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700">
              Pins per day (max 15)
            </label>
            <div className="mt-1">
              <input
                type="number"
                min="1"
                max="15"
                value={pinsPerDay}
                onChange={(e) => setPinsPerDay(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>

          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}
              ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} disabled={isProcessing} />
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <Loader className="h-12 w-12 text-red-500 animate-spin" />
                <p className="mt-2 text-sm text-gray-600">Processing CSV file...</p>
              </div>
            ) : (
              <>
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag & drop your CSV file here, or click to select
                </p>
              </>
            )}
          </div>
        </>
      )}

      {showPreview && schedulePreview.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Schedule Preview</h3>
            <div className="space-x-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Back
              </button>
              <button
                onClick={handleSchedule}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Scheduling...
                  </span>
                ) : (
                  'Schedule All Pins'
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pin Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedulePreview.map((item, index) => {
                    const board = boards.find(b => b.id === item.boardId);
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={item.pin.imageUrl}
                              alt={item.pin.title}
                              className="h-10 w-10 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                              }}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.pin.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.pin.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{board?.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(new Date(item.scheduledTime), 'MMM d, yyyy')}
                            <Clock className="h-4 w-4 mx-2" />
                            {format(new Date(item.scheduledTime), 'h:mm a')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}