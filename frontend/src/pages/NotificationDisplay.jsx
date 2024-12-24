import React, { useContext } from "react";
import { WebSocketContext } from "../WebSocketProvider/";

const NotificationDisplay = () => {
  const { notifications } = useContext(WebSocketContext);

  return (
    <div>
      <h3>Notifications:</h3>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDisplay;
