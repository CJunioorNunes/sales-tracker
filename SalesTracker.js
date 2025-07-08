import React, { useState, useEffect } from 'react';
import { Calendar, Phone, Users, Target, Plus, Eye, Clock, CheckCircle, TrendingUp, UserPlus, Bell, History, AlertCircle } from 'lucide-react';
const SalesTracker = () => {
  const [selectedSalesperson, setSelectedSalesperson] = useState('Anderson Almeida');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showClientHistory, setShowClientHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activities, setActivities] = useState({});
  const [clients, setClients] = useState({});
  const [schedules, setSchedules] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const salespeople = [
    'Anderson Almeida',
    'Elmio Martins',
    'Gustavo Meireles',
    'Gustavo Prado',
    'João Lucas'
  ];
  // Inicializar dados se não existirem
  useEffect(() => {
    if (!activities[selectedSalesperson]) {
      setActivities(prev => ({
        ...prev,
        [selectedSalesperson]: {}
      }));
    }
    if (!clients[selectedSalesperson]) {
      setClients(prev => ({
        ...prev,
        [selectedSalesperson]: []
      }));
    }
    if (!schedules[selectedSalesperson]) {
      setSchedules(prev => ({
        ...prev,
        [selectedSalesperson]: []
      }));
    }
  }, [selectedSalesperson]);
  const getMonthActivities = () => {
    return activities[selectedSalesperson]?.[selectedMonth] || { calls: [], visits: [] };
  };
  const getMonthStats = () => {
    const monthData = getMonthActivities();
    return {
      calls: monthData.calls?.length || 0,
      visits: monthData.visits?.length || 0,
      totalClients: new Set([
        ...(monthData.calls || []).map(c => c.client),
        ...(monthData.visits || []).map(v => v.client)
      ]).size
    };
  };
  const addClient = (clientData) => {
    setClients(prev => ({
      ...prev,
      [selectedSalesperson]: [
        ...(prev[selectedSalesperson] || []),
        {
          id: Date.now(),
          name: clientData.name,
          company: clientData.company,
          phone: clientData.phone,
          email: clientData.email,
          segment: clientData.segment,
          notes: clientData.notes,
          createdAt: new Date().toISOString()
        }
      ]
    }));
  };
  const addActivity = (activityData) => {
    const monthKey = selectedMonth;
    setActivities(prev => ({
      ...prev,
      [selectedSalesperson]: {
        ...prev[selectedSalesperson],
        [monthKey]: {
          calls: prev[selectedSalesperson]?.[monthKey]?.calls || [],
          visits: prev[selectedSalesperson]?.[monthKey]?.visits || [],
          ...prev[selectedSalesperson]?.[monthKey],
          [activityData.type]: [
            ...(prev[selectedSalesperson]?.[monthKey]?.[activityData.type] || []),
            {
              id: Date.now(),
              client: activityData.client,
              subject: activityData.subject,
              date: activityData.date,
              notes: activityData.notes,
              nextCall: activityData.nextCall,
              nextVisit: activityData.nextVisit
            }
          ]
        }
      }
    }));
    // Adicionar agendamentos se especificados
    if (activityData.nextCall || activityData.nextVisit) {
      const newSchedules = [];
      if (activityData.nextCall) {
        newSchedules.push({
          id: Date.now() + 1,
          client: activityData.client,
          type: 'call',
          date: activityData.nextCall,
          notes: `Ligação agendada após: ${activityData.subject}`
        });
      }
      if (activityData.nextVisit) {
        newSchedules.push({
          id: Date.now() + 2,
          client: activityData.client,
          type: 'visit',
          date: activityData.nextVisit,
          notes: `Visita agendada após: ${activityData.subject}`
        });
      }
      setSchedules(prev => ({
        ...prev,
        [selectedSalesperson]: [
          ...(prev[selectedSalesperson] || []),
          ...newSchedules
        ]
      }));
    }
  };
  const getClientHistory = (clientName) => {
    const allActivities = [];
    Object.keys(activities[selectedSalesperson] || {}).forEach(month => {
      const monthData = activities[selectedSalesperson][month];
      [...(monthData.calls || []), ...(monthData.visits || [])]
        .filter(activity => activity.client === clientName)
        .forEach(activity => {
          allActivities.push({
            ...activity,
            month,
            type: monthData.calls?.includes(activity) ? 'call' : 'visit'
          });
        });
    });
    return allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  const getTodaySchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return (schedules[selectedSalesperson] || [])
      .filter(schedule => schedule.date === today);
  };
  const getUpcomingSchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return (schedules[selectedSalesperson] || [])
      .filter(schedule => schedule.date >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  const getOverdueSchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return (schedules[selectedSalesperson] || [])
      .filter(schedule => schedule.date < today);
  };
  const completeSchedule = (scheduleId) => {
    setSchedules(prev => ({
      ...prev,
      [selectedSalesperson]: prev[selectedSalesperson].filter(s => s.id !== scheduleId)
    }));
  };
  const ClientForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      company: '',
      phone: '',
      email: '',
      segment: '',
      notes: ''
    });
    const handleSubmit = () => {
      if (formData.name) {
        addClient(formData);
        setFormData({
          name: '',
          company: '',
          phone: '',
          email: '',
          segment: '',
          notes: ''
        });
        setShowAddClient(false);
      }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Novo Cliente</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Empresa</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="Nome da empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Segmento</label>
              <select
                value={formData.segment}
                onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                <option value="Varejo">Varejo</option>
                <option value="Atacado">Atacado</option>
                <option value="Indústria">Indústria</option>
                <option value="Serviços">Serviços</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Informações adicionais sobre o cliente"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Salvar Cliente
              </button>
              <button
                onClick={() => setShowAddClient(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const ActivityForm = () => {
    const [formData, setFormData] = useState({
      type: 'calls',
      client: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      nextCall: '',
      nextVisit: ''
    });
    const clientList = clients[selectedSalesperson] || [];
    const handleSubmit = () => {
      if (formData.client && formData.subject) {
        addActivity(formData);
        setFormData({
          type: 'calls',
          client: '',
          subject: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
          nextCall: '',
          nextVisit: ''
        });
        setShowAddActivity(false);
      }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Nova Atividade</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="calls">Ligação</option>
                <option value="visits">Visita</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <select
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione um cliente...</option>
                {clientList.map(client => (
                  <option key={client.id} value={client.name}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assunto</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="Assunto da conversa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border rounded-md"
                rows="2"
                placeholder="Observações adicionais"
              />
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Agendar Próximos Contatos</h4>
              <div>
                <label className="block text-sm font-medium mb-1">Próxima Ligação</label>
                <input
                  type="date"
                  value={formData.nextCall}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextCall: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">Próxima Visita</label>
                <input
                  type="date"
                  value={formData.nextVisit}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextVisit: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowAddActivity(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const ClientHistoryModal = () => {
    const history = selectedClient ? getClientHistory(selectedClient.name) : [];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Histórico - {selectedClient?.name}</h3>
            <button
              onClick={() => setShowClientHistory(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p><strong>Empresa:</strong> {selectedClient?.company || 'Não informado'}</p>
            <p><strong>Telefone:</strong> {selectedClient?.phone || 'Não informado'}</p>
            <p><strong>Email:</strong> {selectedClient?.email || 'Não informado'}</p>
            <p><strong>Segmento:</strong> {selectedClient?.segment || 'Não informado'}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <h4 className="font-medium mb-2">Histórico de Atividades</h4>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map(activity => (
                  <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      {activity.type === 'call' ?
                        <Phone size={16} className="text-blue-600" /> :
                        <Users size={16} className="text-green-600" />
                      }
                      <span className="font-medium">{activity.type === 'call' ? 'Ligação' : 'Visita'}</span>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                    <p className="text-sm text-gray-800">{activity.subject}</p>
                    {activity.notes && (
                      <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4">Nenhuma atividade registrada para este cliente</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  const stats = getMonthStats();
  const todaySchedules = getTodaySchedules();
  const upcomingSchedules = getUpcomingSchedules();
  const overdueSchedules = getOverdueSchedules();
  const clientList = clients[selectedSalesperson] || [];
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Sistema de Acompanhamento de Vendas</h1>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendedor</label>
              <select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                className="p-2 border rounded-md"
              >
                {salespeople.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mês</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 border rounded-md"
              />
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'clients', label: 'Clientes', icon: Users },
              { id: 'schedule', label: 'Agenda', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddActivity(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Atividade
            </button>
            <button
              onClick={() => setShowAddClient(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <UserPlus size={20} />
              Novo Cliente
            </button>
          </div>
        </div>
        {/* Alerts */}
        {(todaySchedules.length > 0 || overdueSchedules.length > 0) && (
          <div className="mb-6 space-y-2">
            {todaySchedules.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Bell className="text-yellow-600" size={20} />
                  <span className="font-medium text-yellow-800">
                    Você tem {todaySchedules.length} compromisso(s) para hoje!
                  </span>
                </div>
              </div>
            )}
            {overdueSchedules.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={20} />
                  <span className="font-medium text-red-800">
                    {overdueSchedules.length} compromisso(s) em atraso!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ligações</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.calls}</p>
                  </div>
                  <Phone className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Visitas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.visits}</p>
                  </div>
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Clientes Ativos</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalClients}</p>
                  </div>
                  <Target className="text-purple-600" size={24} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Clientes</p>
                    <p className="text-2xl font-bold text-orange-600">{clientList.length}</p>
                  </div>
                  <Users className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Atividades Recentes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Atividades do Mês
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {[...getMonthActivities().calls || [], ...getMonthActivities().visits || []]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((activity) => (
                      <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          {getMonthActivities().calls?.includes(activity) ?
                            <Phone size={16} className="text-blue-600" /> :
                            <Users size={16} className="text-green-600" />
                          }
                          <span className="font-medium">{activity.client}</span>
                          <span className="text-sm text-gray-500">{activity.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.subject}</p>
                        {activity.notes && (
                          <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                        )}
                      </div>
                    ))}
                  {getMonthActivities().calls?.length === 0 && getMonthActivities().visits?.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Nenhuma atividade registrada este mês</p>
                  )}
                </div>
              </div>
              {/* Próximos Compromissos */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  Próximos Compromissos
                </h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {upcomingSchedules.slice(0, 10).map((schedule) => (
                    <div key={schedule.id} className={`flex items-center justify-between p-3 rounded-md ${
                      schedule.date === new Date().toISOString().split('T')[0]
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {schedule.type === 'call' ?
                          <Phone size={16} className="text-blue-600" /> :
                          <Users size={16} className="text-green-600" />
                        }
                        <div>
                          <span className="font-medium">{schedule.client}</span>
                          <p className="text-xs text-gray-500">{schedule.notes}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{new Date(schedule.date).toLocaleDateString('pt-BR')}</p>
                        <button
                          onClick={() => completeSchedule(schedule.id)}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  ))}
                  {upcomingSchedules.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Nenhum compromisso agendado</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} />
              Clientes Cadastrados ({clientList.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientList.map(client => (
                <div key={client.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{client.name}</h3>
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowClientHistory(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver histórico"
                    >
                      <History size={16} />
                    </button>
                  </div>
                  {client.company && (
                    <p className="text-sm text-gray-600 mb-1">{client.company}</p>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    {client.phone && <p>📞 {client.phone}</p>}
                    {client.email && <p>📧 {client.email}</p>}
                    {client.segment && <p>🏢 {client.segment}</p>}
                  </div>
                  {client.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">{client.notes}</p>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Histórico: {getClientHistory(client.name).length} atividade(s)
                    </p>
                  </div>
                </div>
              ))}
              {clientList.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Users size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum cliente cadastrado ainda</p>
                  <button
                    onClick={() => setShowAddClient(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Cadastrar Primeiro Cliente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Today's Schedule */}
            {todaySchedules.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-600">
                  <Bell size={20} />
                  Compromissos de Hoje
                </h2>
                <div className="space-y-3">
                  {todaySchedules.map(schedule => (
                    <div key={schedule.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {schedule.type === 'call' ?
                            <Phone size={20} className="text-blue-600" /> :
                            <Users size={20} className="text-green-600" />
                          }
                          <div>
                            <h3 className="font-medium">{schedule.client}</h3>
                            <p className="text-sm text-gray-600">{schedule.notes}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => completeSchedule(schedule.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Overdue Schedule */}
            {overdueSchedules.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                  <AlertCircle size={20} />
                  Compromissos em Atraso
                </h2>
                <div className="space-y-3">
                  {overdueSchedules.map(schedule => (
                    <div key={schedule.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {schedule.type === 'call' ?
                            <Phone size={20} className="text-blue-600" /> :
                            <Users size={20} className="text-green-600" />
                          }
                          <div>
                            <h3 className="font-medium">{schedule.client}</h3>
                            <p className="text-sm text-gray-600">{schedule.notes}</p>
                            <p className="text-xs text-red-600">
                              Atrasado desde: {new Date(schedule.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => completeSchedule(schedule.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Upcoming Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Próximos Compromissos
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {upcomingSchedules.filter(s => s.date > new Date().toISOString().split('T')[0]).map(schedule => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {schedule.type === 'call' ?
                          <Phone size={20} className="text-blue-600" /> :
                          <Users size={20} className="text-green-600" />
                        }
                        <div>
                          <h3 className="font-medium">{schedule.client}</h3>
                          <p className="text-sm text-gray-600">{schedule.notes}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(schedule.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => completeSchedule(schedule.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Concluir
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingSchedules.filter(s => s.date > new Date().toISOString().split('T')[0]).length === 0 && (
                  <div className="text-center py-12">
                    <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum compromisso futuro agendado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modals */}
      {showAddActivity && <ActivityForm />}
      {showAddClient && <ClientForm />}
      {showClientHistory && selectedClient && <ClientHistoryModal />}
    </div>
  );
};
export default SalesTracker;