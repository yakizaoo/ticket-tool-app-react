import React from 'react';
import CreateTicket from '../components/CreateTicket';
import TicketList from '../components/TicketList';

const Home = () => {
    return (
        <div>
            <CreateTicket />
            <TicketList />
        </div>
    );
};

export default Home;