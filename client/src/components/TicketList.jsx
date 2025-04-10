import { useEffect, useState } from 'react';
import { getTickets } from '../../services/api';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    getTickets().then(response => setTickets(response.data));
  }, []);
  
  return (
    <div>{tickets.map(ticket => (
      <div key={ticket.id}>{ticket.title}</div>
    ))}</div>
  );
}