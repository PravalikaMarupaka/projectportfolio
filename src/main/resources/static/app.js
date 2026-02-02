const API_BASE_URL = 'http://localhost:8080/api';

let currentUserId = 1;
let assetAllocationChart = null;
let portfolioGrowthChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    loadDashboard();
    loadUserInfo();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(pageName).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    if (pageName === 'dashboard') {
        loadDashboard();
    } else if (pageName === 'holdings') {
        loadHoldings();
    } else if (pageName === 'performance') {
        loadPerformance();
    }
}

// Dashboard
function loadDashboard() {
    currentUserId = document.getElementById('userId').value;
    loadPortfolio();
    loadTrendingStocks();
}

async function loadPortfolio() {
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/user/${currentUserId}`);
        const portfolio = await response.json();
        
        // Update summary cards
        document.getElementById('totalValue').textContent = formatCurrency(portfolio.totalValue);
        document.getElementById('totalCost').textContent = formatCurrency(portfolio.totalCost);
        
        const profitLoss = portfolio.totalProfitLoss;
        const profitLossElement = document.getElementById('profitLoss');
        profitLossElement.textContent = formatCurrency(profitLoss);
        profitLossElement.className = profitLoss >= 0 ? 'value positive' : 'value negative';
        
        const profitLossPercent = portfolio.totalProfitLossPercentage;
        const profitLossPercentElement = document.getElementById('profitLossPercent');
        profitLossPercentElement.textContent = formatPercent(profitLossPercent);
        profitLossPercentElement.className = profitLossPercent >= 0 ? 'value positive' : 'value negative';
        
        // Update holdings table
        updateHoldingsTable(portfolio.holdings);
        
        // Update charts
        updateAssetAllocationChart(portfolio.assetAllocation);
        updatePortfolioGrowthChart(portfolio.holdings);
    } catch (error) {
        console.error('Error loading portfolio:', error);
        alert('Error loading portfolio data');
    }
}

function updateHoldingsTable(holdings) {
    const tbody = document.getElementById('holdingsTableBody');
    tbody.innerHTML = '';
    
    holdings.slice(0, 10).forEach(holding => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${holding.symbol}</strong></td>
            <td>${holding.companyName}</td>
            <td>${holding.quantity}</td>
            <td>${formatCurrency(holding.buyPrice)}</td>
            <td>${formatCurrency(holding.currentPrice)}</td>
            <td>${formatCurrency(holding.currentValue)}</td>
            <td class="${holding.profitLoss >= 0 ? 'positive' : 'negative'}">${formatCurrency(holding.profitLoss)}</td>
            <td class="${holding.profitLossPercentage >= 0 ? 'positive' : 'negative'}">${formatPercent(holding.profitLossPercentage)}</td>
        `;
    });
}

function updateAssetAllocationChart(allocation) {
    const ctx = document.getElementById('assetAllocationChart').getContext('2d');
    
    if (assetAllocationChart) {
        assetAllocationChart.destroy();
    }
    
    assetAllocationChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Stocks', 'Bonds', 'Crypto', 'Cash'],
            datasets: [{
                data: [
                    allocation.stocks || 0,
                    allocation.bonds || 0,
                    allocation.crypto || 0,
                    allocation.cash || 0
                ],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function updatePortfolioGrowthChart(holdings) {
    const ctx = document.getElementById('portfolioGrowthChart').getContext('2d');
    
    if (portfolioGrowthChart) {
        portfolioGrowthChart.destroy();
    }
    
    // Mock historical data (in real app, fetch from API)
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [10000, 12000, 11500, 13000, 12500, 14000];
    
    portfolioGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Holdings
async function loadHoldings() {
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/user/${currentUserId}`);
        const portfolio = await response.json();
        
        const tbody = document.getElementById('allHoldingsTableBody');
        tbody.innerHTML = '';
        
        portfolio.holdings.forEach(holding => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><strong>${holding.symbol}</strong></td>
                <td>${holding.companyName}</td>
                <td>${holding.quantity}</td>
                <td>${formatCurrency(holding.buyPrice)}</td>
                <td>${holding.buyDate}</td>
                <td>${formatCurrency(holding.currentPrice)}</td>
                <td>${formatCurrency(holding.currentValue)}</td>
                <td class="${holding.profitLoss >= 0 ? 'positive' : 'negative'}">${formatCurrency(holding.profitLoss)}</td>
                <td class="${holding.profitLossPercentage >= 0 ? 'positive' : 'negative'}">${formatPercent(holding.profitLossPercentage)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="showSellStockModal(${holding.investmentId}, ${holding.quantity})">Sell</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading holdings:', error);
        alert('Error loading holdings');
    }
}

// Performance
async function loadPerformance() {
    try {
        const response = await fetch(`${API_BASE_URL}/risk/analyze/${currentUserId}`);
        const analysis = await response.json();
        
        document.getElementById('riskCategory').textContent = analysis.riskCategory;
        document.getElementById('volatilityScore').textContent = analysis.volatilityScore + '/10';
        document.getElementById('diversificationScore').textContent = analysis.diversificationScore + '/10';
        document.getElementById('maxLossTolerance').textContent = analysis.maxLossTolerance + '%';
        
        const detailsDiv = document.getElementById('riskDetails');
        detailsDiv.innerHTML = `
            <p><strong>Risk Level:</strong> ${analysis.riskLevel}</p>
            <p><strong>Recommendation:</strong> ${analysis.recommendation}</p>
            <h4>Risk Factors:</h4>
            <ul>
                ${analysis.riskFactors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
            <h4>Suggestions:</h4>
            <ul>
                ${analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
        `;
    } catch (error) {
        console.error('Error loading performance:', error);
        alert('Error loading performance data');
    }
}

// Chatbot
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: parseInt(currentUserId),
                message: message,
                consentGiven: true
            })
        });
        
        const data = await response.json();
        addChatMessage(data.response, 'bot');
        
        // Update quick actions if provided
        if (data.quickActions) {
            updateQuickActions(data.quickActions);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function sendQuickAction(action) {
    document.getElementById('chatInput').value = action;
    sendChatMessage();
}

function addChatMessage(message, type) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = `<p>${message.replace(/\n/g, '<br>')}</p>`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateQuickActions(actions) {
    const quickActionsDiv = document.getElementById('quickActions');
    quickActionsDiv.innerHTML = actions.map(action => 
        `<button class="btn btn-secondary" onclick="sendQuickAction('${action}')">${action}</button>`
    ).join('');
}

// Buy/Sell Stock
function showBuyStockModal() {
    document.getElementById('buyStockModal').style.display = 'block';
}

function closeBuyStockModal() {
    document.getElementById('buyStockModal').style.display = 'none';
    document.getElementById('buyStockForm').reset();
}

async function buyStock(event) {
    event.preventDefault();
    
    const symbol = document.getElementById('stockSymbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('quantity').value);
    const buyPrice = parseFloat(document.getElementById('buyPrice').value);
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/buy?userId=${currentUserId}&symbol=${symbol}&quantity=${quantity}&buyPrice=${buyPrice}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            alert('Stock purchased successfully!');
            closeBuyStockModal();
            loadDashboard();
            loadHoldings();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Failed to buy stock'));
        }
    } catch (error) {
        console.error('Error buying stock:', error);
        alert('Error buying stock');
    }
}

function showSellStockModal(investmentId, maxQuantity) {
    const quantity = prompt(`Enter quantity to sell (max: ${maxQuantity}):`, maxQuantity);
    if (quantity && quantity > 0 && quantity <= maxQuantity) {
        sellStock(investmentId, parseInt(quantity));
    }
}

async function sellStock(investmentId, quantity) {
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/sell?userId=${currentUserId}&investmentId=${investmentId}&quantity=${quantity}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            alert('Stock sold successfully!');
            loadDashboard();
            loadHoldings();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Failed to sell stock'));
        }
    } catch (error) {
        console.error('Error selling stock:', error);
        alert('Error selling stock');
    }
}

// User Info
async function loadUserInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId}`);
        const user = await response.json();
        
        document.getElementById('userInfo').innerHTML = `
            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
        `;
        
        if (user.bankAccount) {
            document.getElementById('bankAccountInfo').innerHTML = `
                <p><strong>Account Number:</strong> ${user.bankAccount.accountNumber}</p>
                <p><strong>Bank Name:</strong> ${user.bankAccount.bankName}</p>
                <p><strong>Balance:</strong> ${formatCurrency(user.bankAccount.currentBalance)}</p>
                <p><strong>Account Type:</strong> ${user.bankAccount.accountType}</p>
            `;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Trending Stocks
async function loadTrendingStocks() {
    try {
        const response = await fetch(`${API_BASE_URL}/stocks/trending`);
        const stocks = await response.json();
        // Can display trending stocks in a widget if needed
    } catch (error) {
        console.error('Error loading trending stocks:', error);
    }
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value || 0);
}

function formatPercent(value) {
    return (value || 0).toFixed(2) + '%';
}
