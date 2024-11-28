import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Calendar, Image as ImageIcon, Link as LinkIcon, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { useBoards } from '../../hooks/useBoards';
import { useScheduledPins } from '../../hooks/useScheduledPins';
import toast from 'react-hot-toast';

export function SinglePinForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { boards, isLoading: boardsLoading } = useBoards();
  const { schedulePin } = useScheduledPins();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await schedulePin({
        title,
        description,
        link,
        imageFile,
        imagePreview, // Pass the preview URL
        boardId: selectedBoard,
        scheduledTime
      });

      if (success) {
        // Reset form
        setTitle('');
        setDescription('');
        setLink('');
        setImageFile(null);
        setImagePreview('');
        setScheduledTime('');
        setSelectedBoard('');
        toast.success('Pin scheduled successfully!');
      }
    } catch (error) {
      console.error('Error scheduling pin:', error);
      toast.error('Failed to schedule pin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div {...getRootProps()} className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}
      `}>
        <input {...getInputProps()} />
        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop an image here, or click to select
        </p>
      </div>

      {imagePreview && (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImagePreview('');
            }}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Enter pin title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Enter pin description"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Link (optional)</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
              <LinkIcon className="h-4 w-4" />
            </span>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-red-500 focus:ring-red-500"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Board</label>
          <div className="mt-1 relative">
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 ${
                boardsLoading ? 'bg-gray-50' : ''
              }`}
              disabled={boardsLoading}
              required
            >
              <option value="">Select a board</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
            {boardsLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Loader className="animate-spin h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || boardsLoading}
          className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
            ${(isSubmitting || boardsLoading)
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader className="animate-spin h-4 w-4 mr-2" />
              Scheduling...
            </span>
          ) : boardsLoading ? (
            <span className="flex items-center">
              <Loader className="animate-spin h-4 w-4 mr-2" />
              Loading Boards...
            </span>
          ) : (
            'Schedule Pin'
          )}
        </button>
      </div>
    </form>
  );
}