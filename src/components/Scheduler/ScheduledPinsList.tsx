import { FC } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Trash2, SendHorizonal, Clock } from 'lucide-react';
import { RootState } from '../../store/store';
import { useScheduledPins } from '../../hooks/useScheduledPins';
import { useAuth } from '../../hooks/useAuth';
import { ScheduledPin } from '../../store/slices/schedulerSlice';
import toast from 'react-hot-toast';

export const ScheduledPinsList: FC = () => {
  const { userData, refreshToken } = useAuth();
  const { scheduledPins } = useSelector((state: RootState) => state.scheduler);
  const { items: boards } = useSelector((state: RootState) => state.boards);
  const { updatePin, deletePin } = useScheduledPins();

  const handlePublishNow = async (pin: ScheduledPin) => {
    if (!userData?.token?.access_token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    // Update pin status to indicate publishing
    updatePin(pin.id, { status: 'publishing' });

    try {
      // For data URLs, we'll use a placeholder image URL
      // In production, you should upload the image to a storage service
      let imageUrl = pin.imageUrl;
      if (imageUrl.startsWith('data:')) {
        imageUrl = 'https://picsum.photos/800/600';
      }

      const pinData = {
        title: pin.title,
        description: pin.description,
        board_id: pin.boardId,
        media_source: {
          source_type: 'image_url',
          url: imageUrl
        },
        ...(pin.link && { link: pin.link })
      };

      const response = await fetch('/.netlify/functions/pinterest-api?path=/pins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pinData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            return handlePublishNow(pin);
          }
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.message || 'Failed to publish pin');
      }

      // Update pin status to published
      updatePin(pin.id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        pinterestId: data.id
      });

      toast.success('Pin published successfully to Pinterest');
    } catch (error) {
      console.error('Publish error:', error);
      
      updatePin(pin.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to publish pin'
      });

      toast.error(error instanceof Error ? error.message : 'Failed to publish pin');
    }
  };

  const getBoardName = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    return board?.name || 'Unknown Board';
  };

  if (scheduledPins.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled pins</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new scheduled pin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Scheduled Pins</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {scheduledPins.map((pin) => (
            <div key={pin.id} className="p-6 flex items-start space-x-6">
              <div className="flex-shrink-0 w-24 h-24">
                <img
                  src={pin.imageUrl}
                  alt={pin.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900 truncate">
                    {pin.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePublishNow(pin)}
                      disabled={pin.status === 'published' || pin.status === 'publishing'}
                      className={`p-2 rounded-lg text-sm font-medium ${
                        pin.status === 'published'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : pin.status === 'publishing'
                          ? 'bg-yellow-50 text-yellow-600 cursor-wait'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={
                        pin.status === 'published' 
                          ? 'Already published' 
                          : pin.status === 'publishing'
                          ? 'Publishing...'
                          : 'Publish now'
                      }
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePin(pin.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete pin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {pin.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(pin.scheduledTime), 'MMM d, yyyy h:mm a')}
                  </span>
                  <span>•</span>
                  <span>{getBoardName(pin.boardId)}</span>
                  <span>•</span>
                  <span className={`capitalize ${
                    pin.status === 'published' ? 'text-green-600' :
                    pin.status === 'publishing' ? 'text-yellow-600' :
                    pin.status === 'failed' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {pin.status}
                  </span>
                </div>
                {pin.link && (
                  <div className="mt-2">
                    <a
                      href={pin.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {pin.link}
                    </a>
                  </div>
                )}
                {pin.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {pin.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};