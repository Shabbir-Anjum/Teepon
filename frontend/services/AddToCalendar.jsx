import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
const AddToCalendar = ({ eventDetails, children }) => {
  const [isAdding, setIsAdding] = useState(false);
  const accessToken = localStorage.getItem('accessToken');
  const token = useSelector((state) => state.chat.token);
  const addEventToCalendar = async () => {
    setIsAdding(true);
console.log( accessToken,'calender')
console.log(token,'add calender')
    const event = {
      summary: eventDetails.summary,
      location: eventDetails.location,
      start: {
        dateTime: eventDetails.startDateTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventDetails.endDateTime,
        timeZone: 'UTC',
      },
    };

    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to add event to calendar');
      }

      const data = await response.json();
      console.log('Event added: ', data);
      toast.success('Event added to calendar successfully!', {
        autoClose: 3000,
      });
    
    } catch (err) {
      console.error('Error adding event: ', err);
      if (err.message.includes('insufficient authentication scopes')) {
        toast.error('Insufficient permissions to add events. Please ensure you have granted calendar access.');
        console.log('Please request the https://www.googleapis.com/auth/calendar.events scope');
      } else {
        toast.error(`Failed to add event: ${err.message}`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return children({ onClick: addEventToCalendar, isAdding });
};

export default AddToCalendar;