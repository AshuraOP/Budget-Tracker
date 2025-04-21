document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const dashboardTab = document.getElementById('dashboardTab');
  const goalsTab = document.getElementById('goalsTab');
  const communityTab = document.getElementById('communityTab');

  const dashboardSection = document.getElementById('dashboardSection');
  const goalsSection = document.getElementById('goalsSection');
  const communitySection = document.getElementById('communitySection');

  function showSection(section) {
    dashboardSection.classList.add('hidden');
    goalsSection.classList.add('hidden');
    communitySection.classList.add('hidden');
    section.classList.remove('hidden');
  }

  function setActiveTab(tab) {
    [dashboardTab, goalsTab, communityTab].forEach(t => {
      t.classList.remove('border-blue-600');
      t.classList.remove('font-semibold');
      t.classList.add('font-medium');
      t.classList.remove('pb-1');
    });
    tab.classList.add('border-blue-600');
    tab.classList.add('font-semibold');
    tab.classList.add('pb-1');
  }

  dashboardTab.addEventListener('click', () => {
    showSection(dashboardSection);
    setActiveTab(dashboardTab);
  });

  goalsTab.addEventListener('click', () => {
    showSection(goalsSection);
    setActiveTab(goalsTab);
  });

  communityTab.addEventListener('click', () => {
    showSection(communitySection);
    setActiveTab(communityTab);
  });

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    // Change icon
    const icon = darkModeToggle.querySelector('i');
    if (document.documentElement.classList.contains('dark')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });

  // Data keys
  const TRANSACTIONS_KEY = 'budgetTrackerTransactions';
  const GOALS_KEY = 'budgetTrackerGoals';

  // Elements
  const transactionForm = document.getElementById('transactionForm');
  const transactionList = document.getElementById('transactionList');
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const balanceEl = document.getElementById('balance');

  const goalForm = document.getElementById('goalForm');
  const goalList = document.getElementById('goalList');

  // Chart elements
  const chartCanvas = document.createElement('canvas');
  chartCanvas.id = 'budgetChart';
  chartCanvas.className = 'mt-8 bg-white rounded-lg shadow p-6';
  dashboardSection.appendChild(chartCanvas);

  let budgetChart = null;

  // Load data from localStorage
  let transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
  let goals = JSON.parse(localStorage.getItem(GOALS_KEY)) || [];

  // Utility functions
  function formatCurrency(amount) {
    return '₹' + amount.toFixed(2);
  }

  function saveTransactions() {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  function saveGoals() {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  // Render transactions
  function renderTransactions() {
    transactionList.innerHTML = '';
    transactions.forEach((tx, index) => {
      const tr = document.createElement('tr');
      tr.classList.add('border-b', 'border-gray-100', 'hover:bg-gray-50', 'dark:hover:bg-gray-700', 'transition');

      const descTd = document.createElement('td');
      descTd.className = 'py-2 px-3';
      descTd.textContent = tx.description;

      const amountTd = document.createElement('td');
      amountTd.className = 'py-2 px-3';
      amountTd.textContent = formatCurrency(tx.amount);
      amountTd.classList.add(tx.type === 'income' || tx.type === 'savings' || tx.type === 'investment' ? 'text-green-600' : 'text-red-600');

      const typeTd = document.createElement('td');
      typeTd.className = 'py-2 px-3 capitalize';
      typeTd.textContent = tx.type;

      const dateTd = document.createElement('td');
      dateTd.className = 'py-2 px-3';
      dateTd.textContent = new Date(tx.date).toLocaleDateString();

      const actionsTd = document.createElement('td');
      actionsTd.className = 'py-2 px-3';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition';
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteBtn.title = 'Delete transaction';
      deleteBtn.addEventListener('click', () => {
        transactions.splice(index, 1);
        saveTransactions();
        renderTransactions();
        updateSummary();
        updateGoalsProgress();
        updateChart();
      });

      actionsTd.appendChild(deleteBtn);

      tr.appendChild(descTd);
      tr.appendChild(amountTd);
      tr.appendChild(typeTd);
      tr.appendChild(dateTd);
      tr.appendChild(actionsTd);

      transactionList.appendChild(tr);
    });
  }

  // Update summary totals
  function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(tx => {
      if (tx.type === 'income' || tx.type === 'savings' || tx.type === 'investment') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpenses += tx.amount;
      }
    });

    const balance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    balanceEl.textContent = formatCurrency(balance);
  }

  // Render goals
  function renderGoals() {
    goalList.innerHTML = '';
    if (goals.length === 0) {
      goalList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No goals set yet.</p>';
      return;
    }
    goals.forEach((goal, index) => {
      const div = document.createElement('div');
      div.className = 'bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'mb-2 md:mb-0';

      const nameP = document.createElement('p');
      nameP.className = 'font-semibold text-green-700 dark:text-green-300 text-lg';
      nameP.textContent = goal.name;

      const targetP = document.createElement('p');
      targetP.className = 'text-green-600 dark:text-green-400';
      targetP.textContent = `Target: ${formatCurrency(goal.amount)}`;

      const progressP = document.createElement('p');
      progressP.className = 'text-green-600 dark:text-green-400';
      progressP.textContent = `Progress: ${formatCurrency(goal.progress || 0)}`;

      infoDiv.appendChild(nameP);
      infoDiv.appendChild(targetP);
      infoDiv.appendChild(progressP);

      const progressBarContainer = document.createElement('div');
      progressBarContainer.className = 'w-full md:w-1/3 bg-green-200 dark:bg-green-700 rounded-full h-4 overflow-hidden';

      const progressBar = document.createElement('div');
      progressBar.className = 'bg-green-600 dark:bg-green-400 h-4 rounded-full transition-all duration-500 ease-in-out';
      const progressPercent = Math.min((goal.progress || 0) / goal.amount * 100, 100);
      progressBar.style.width = progressPercent + '%';

      progressBarContainer.appendChild(progressBar);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'mt-2 md:mt-0 md:ml-4 flex space-x-2';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition';
      deleteBtn.title = 'Delete goal';
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteBtn.addEventListener('click', () => {
        goals.splice(index, 1);
        saveGoals();
        renderGoals();
      });

      actionsDiv.appendChild(deleteBtn);

      div.appendChild(infoDiv);
      div.appendChild(progressBarContainer);
      div.appendChild(actionsDiv);

      goalList.appendChild(div);
    });
  }

  // Update goals progress based on transactions
  function updateGoalsProgress() {
    goals.forEach(goal => {
      let progress = 0;
      transactions.forEach(tx => {
        if (tx.type === 'income' || tx.type === 'savings' || tx.type === 'investment') {
          if (tx.description.toLowerCase().includes(goal.name.toLowerCase())) {
            progress += tx.amount;
          }
        }
      });
      goal.progress = progress;
    });
    saveGoals();
    renderGoals();
  }

  // Add transaction
  transactionForm.addEventListener('submit', e => {
    e.preventDefault();
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!description || isNaN(amount) || amount <= 0 || !type) {
      alert('Please fill in all fields with valid values.');
      return;
    }

    const transaction = {
      description,
      amount,
      type,
      date: new Date().toISOString()
    };

    transactions.push(transaction);
    saveTransactions();
    renderTransactions();
    updateSummary();
    updateGoalsProgress();
    updateChart();

    transactionForm.reset();
  });

  // Add goal
  goalForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const amount = parseFloat(document.getElementById('goalAmount').value);

    if (!name || isNaN(amount) || amount <= 0) {
      alert('Please fill in all fields with valid values.');
      return;
    }

    const goal = {
      name,
      amount,
      progress: 0
    };

    goals.push(goal);
    saveGoals();
    renderGoals();

    goalForm.reset();
  });

  // Chart elements
  const chartCanvas = document.createElement('canvas');
  chartCanvas.id = 'budgetChart';
  chartCanvas.className = 'mt-8 bg-white rounded-lg shadow p-6';
  dashboardSection.appendChild(chartCanvas);

  let budgetChart = null;

  // Chart update
  function updateChart() {
    const income = transactions.filter(tx => tx.type === 'income' || tx.type === 'savings' || tx.type === 'investment')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = transactions.filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const balance = income - expenses;

    const data = {
      labels: ['Income', 'Expenses', 'Balance'],
      datasets: [{
        label: 'Amount (₹)',
        data: [income, expenses, balance],
        backgroundColor: [
          'rgba(34,197,94,0.7)', // green
          'rgba(239,68,68,0.7)', // red
          'rgba(59,130,246,0.7)' // blue
        ],
        borderColor: [
          'rgba(34,197,94,1)',
          'rgba(239,68,68,1)',
          'rgba(59,130,246,1)'
        ],
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--tw-text-opacity') === '1' ? '#000' : '#fff'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--tw-text-opacity') === '1' ? '#000' : '#fff'
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--tw-text-opacity') === '1' ? '#000' : '#fff'
          }
        }
      }
    };

    if (budgetChart) {
      budgetChart.data = data;
      budgetChart.options = options;
      budgetChart.update();
    } else {
      budgetChart = new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: data,
        options: options
      });
    }
  }

  // Initial render
  renderTransactions();
  updateSummary();
  renderGoals();
  updateChart();

  // Show dashboard by default
  showSection(dashboardSection);
  setActiveTab(dashboardTab);

  // Initialize dark mode icon based on current state
  const icon = darkModeToggle.querySelector('i');
  if (document.documentElement.classList.contains('dark')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
});
