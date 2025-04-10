import React, { useState } from 'react';
import axios from 'axios';

const CreateTicket = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [urgency, setUrgency] = useState('');
    const [assignedRole, setAssignedRole] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/tickets', {
                title,
                description,
                category,
                urgency,
                assigned_role: assignedRole,
            });
            console.log('Ticket created:', response.data);
            // Reset form or redirect
        } catch (err) {
            setError(err.response.data.error || 'Ошибка при создании тикета');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Ticket</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="task">Task</option>
            </select>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} required>
                <option value="">Select Urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
            <input type="text" placeholder="Assigned Role" value={assignedRole} onChange={(e) => setAssignedRole(e.target.value)} />
            <button type="submit">Create Ticket</button>
        </form>
    );
};

export default CreateTicket;