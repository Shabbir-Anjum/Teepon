import React from 'react';
import { motion } from 'framer-motion';
import AddToCalendar from '@/services/AddToCalendar';
import { FaCalendarPlus } from 'react-icons/fa';
const Recommendation = ({ AiResponse }) => {
  const { dates, location } = AiResponse;

  return (
     <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-100 p-6 max-h-64 overflow-y-auto mt-4"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">Recommended Outings</h3>
      {dates.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 * (index + 1) }}
          className="bg-white rounded-lg shadow-md p-4 mb-4"
        >
          <h4 className="text-lg font-semibold mb-2 text-gray-700">Outing {index + 1}</h4>
          <p className="text-gray-600 mb-1">{item.date}</p>
          <p className="text-gray-800">Location: {location[0]}</p>
          
          <AddToCalendar
  eventDetails={{
    summary:'Event',
    location: location[0] ? location[0] : 'Unknown Location',
    startDateTime: '2024-08-10T10:00:00Z',
    endDateTime: '2024-09-10T11:00:00Z'
  }}
>
            {({ onClick, isAdding }) => (
              <button
                onClick={onClick}
                disabled={isAdding}
                className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300 transition-colors duration-200"
              >
                <FaCalendarPlus className="mr-2" />
                {isAdding ? 'Adding...' : 'Add to Calendar'}
              </button>
            )}
          </AddToCalendar>
        </motion.div>
        
      ))}
    </motion.div>
  );
};

export default Recommendation;