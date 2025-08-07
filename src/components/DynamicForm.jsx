import React, { useState } from 'react';
import '../DynamicForm.css';

function DynamicForm() {
    const [entries, setEntries] = useState([
        { building: '', temperature: '', date: '', time: '' }
    ]);
    const [reports, setReports] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    const addEntry = () => {
        setEntries([...entries, { building: '', temperature: '', date: '', time: '' }]);
    };

    const updateEntry = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const removeEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        fetch('http://localhost:4222/api/create-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entries)
        })
    };

    const fetchResults = () => {
        if (!selectedDate) {
            alert('Выберите дату');
            return;
        }
        const params = new URLSearchParams({
            date: selectedDate
        })

        fetch(`http://localhost:4222/api/avg-data?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.results) {
                    setReports([...reports, data.results]);
                }
            })
            .catch(err => console.error('Ошибка fetch:', err));
    };

    const fetchAllReports = () => {
        fetch('http://localhost:4222/api/reports')
            .then(res => res.json())
            .then(data => {
                setReports(data.results.filter(report =>
                    report && report.date_settlement && report.date_avg &&
                    report.temperature_avg != null && Array.isArray(report.use_temperature)
                ));
            })
            .catch(err => console.error('Ошибка fetch (все отчёты):', err));
    };

    return (
        <div className="form-container">
            <h1>Добавить данные</h1>
            {entries.map((entry, index) => (
                <div key={index} className="entry">
                    <div className="form-grid">
                        <input
                            type="text"
                            placeholder="Здание"
                            value={entry.building}
                            onChange={(e) => updateEntry(index, 'building', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Температура (°C)"
                            value={entry.temperature}
                            onChange={(e) => updateEntry(index, 'temperature', e.target.value)}
                        />
                        <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateEntry(index, 'date', e.target.value)}
                        />
                        <input
                            type="time"
                            value={entry.time}
                            onChange={(e) => updateEntry(index, 'time', e.target.value)}
                        />
                    </div>
                    {entries.length > 1 && (
                        <button onClick={() => removeEntry(index)} className="remove-btn">
                            Удалить
                        </button>
                    )}
                </div>
            ))}
            <button onClick={addEntry} className="add-btn">
                Добавить набор
            </button>
            <button onClick={handleSubmit} className="submit-btn">
                Отправить
            </button>
            <div className="report-controls">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="Выберите дату"
                />
                <button onClick={fetchResults} className="fetch-btn">
                    Добавить отчёт
                </button>
                <button onClick={fetchAllReports} className="fetch-btn">
                    История отчётов
                </button>
            </div>
            <div className="results">
                <h2>Отчёты:</h2>
                {reports.length > 0 ? (
                    <table className="results-table">
                        <thead>
                        <tr>
                            <th>Дата создания</th>
                            <th>Дата усреднения</th>
                            <th>Средняя температура</th>
                            <th>Температуры</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reports.map((report, index) => (
                            <tr key={index}>
                                <td>{new Date(report.date_settlement).toLocaleString()}</td>
                                <td>{new Date(report.date_avg).toLocaleString()}</td>
                                <td>{report.temperature_avg}°C</td>
                                <td>{Array.isArray(report.use_temperature) ? report.use_temperature.join(', ') : 'Нет данных'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Нет отчётов</p>
                )}
            </div>
        </div>
    );
}

export default DynamicForm;