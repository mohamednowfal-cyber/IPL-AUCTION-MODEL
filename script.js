// IPL Auction Application JavaScript

class IPLAuction {
    constructor() {
        this.players = [];
        this.teams = [
            { name: 'CSK', fullName: 'Chennai Super Kings', budget: 100, players: [], rtm: true, color: '#ffff3c' },
            { name: 'MI', fullName: 'Mumbai Indians', budget: 100, players: [], rtm: true, color: '#004ba0' },
            { name: 'RCB', fullName: 'Royal Challengers Bangalore', budget: 100, players: [], rtm: true, color: '#d5152b' },
            { name: 'KKR', fullName: 'Kolkata Knight Riders', budget: 100, players: [], rtm: true, color: '#3a225d' },
            { name: 'GT', fullName: 'Gujarat Titans', budget: 100, players: [], rtm: true, color: '#7c3aed' },
            { name: 'LSG', fullName: 'Lucknow Super Giants', budget: 100, players: [], rtm: true, color: '#00d4aa' },
            { name: 'RR', fullName: 'Rajasthan Royals', budget: 100, players: [], rtm: true, color: '#254aa5' },
            { name: 'SRH', fullName: 'Sunrisers Hyderabad', budget: 100, players: [], rtm: true, color: '#ff822a' },
            { name: 'DC', fullName: 'Delhi Capitals', budget: 100, players: [], rtm: true, color: '#004c93' },
            { name: 'PBKS', fullName: 'Punjab Kings', budget: 100, players: [], rtm: true, color: '#ed1c24' }
        ];
        this.currentPlayerIndex = 0;
        this.currentBid = 0;
        this.currentBidTeam = null;
        this.selectedTeam = null;
        this.auctionActive = false;
        this.currentBidStep = 10; // Default bid step in lakhs
        this.biddingHistory = [];
        this.totalSpent = 0;
        
        this.initializePlayers();
        this.initializeUI();
        this.bindEvents();
        this.initializeTheme();
    }

    initializePlayers() {
        this.players = this.loadIPLPlayers();
    }

    loadIPLPlayers() {
        // Complete IPL 2024 player data (220 players)
        const players = [];
        
        // Process all player categories from the external data
        const processPlayers = (playerList, role) => {
            playerList.forEach(player => {
                players.push({
                    name: player.name,
                    role: role,
                    country: player.country,
                    basePrice: player.basePrice,
                    previousTeam: player.team,
                    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319000/319095.jpg', // Default image
                    sold: false,
                    stats: this.generatePlayerStats(player.capped === 'Capped')
                });
            });
        };

        // Process all categories
        processPlayers(IPL_PLAYERS_DATA.allRounders, 'All-Rounder');
        processPlayers(IPL_PLAYERS_DATA.batsmen, 'Batsman');
        processPlayers(IPL_PLAYERS_DATA.bowlers, 'Bowler');

        return players;
    }

    generatePlayerStats(isCapped) {
        // Generate realistic stats based on whether player is capped or not
        const baseMatches = isCapped ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 30) + 10;
        const baseRuns = isCapped ? Math.floor(Math.random() * 2000) + 500 : Math.floor(Math.random() * 500) + 100;
        const baseWickets = isCapped ? Math.floor(Math.random() * 100) + 20 : Math.floor(Math.random() * 30) + 5;
        
        return {
            matches: baseMatches,
            runs: baseRuns,
            wickets: baseWickets,
            avg: parseFloat((baseRuns / baseMatches).toFixed(1)),
            sr: parseFloat((120 + Math.random() * 60).toFixed(1)),
            econ: parseFloat((6 + Math.random() * 3).toFixed(1)),
            lastSeason: '2023',
            experience: isCapped ? `${Math.floor(Math.random() * 10) + 5} years` : `${Math.floor(Math.random() * 3) + 1} years`
        };
    }

    getLocalImageUrl(playerName) {
        // Convert player name to match the actual file names in profile pic folder
        // The files use various extensions (.png, .jpg, .jpeg, .avif, .webp)
        const extensions = ['.png', '.jpg', '.jpeg', '.avif', '.webp'];
        
        // Try different variations of the name
        const nameVariations = [
            playerName, // Original name
            playerName.replace(/\s+/g, ' '), // Normalize spaces
            playerName.replace(/[^\w\s]/g, ''), // Remove special characters
            playerName.replace(/\s+/g, '_'), // Replace spaces with underscores
            playerName.replace(/\s+/g, '-'), // Replace spaces with hyphens
            playerName.toLowerCase(),
            playerName.toLowerCase().replace(/\s+/g, '_'),
            playerName.toLowerCase().replace(/\s+/g, '-')
        ];
        
        // Return the first variation - we'll check for file existence in fetchLocalImage
        return { name: playerName, variations: nameVariations, extensions: extensions };
    }

    async fetchLocalImage(playerName) {
        try {
            const imageInfo = this.getLocalImageUrl(playerName);
            
            // Try to find the correct image file by testing different variations
            return new Promise((resolve) => {
                let currentIndex = 0;
                let currentExtIndex = 0;
                
                const tryNextImage = () => {
                    if (currentIndex >= imageInfo.variations.length) {
                        console.log(`Could not find local image for ${playerName}, using default`);
                        resolve('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319000/319095.jpg');
                        return;
                    }
                    
                    const currentName = imageInfo.variations[currentIndex];
                    const currentExt = imageInfo.extensions[currentExtIndex];
                    const imagePath = `profile pic/${currentName}${currentExt}`;
                    
                    const img = new Image();
                    img.onload = () => {
                        console.log(`Found image for ${playerName}: ${imagePath}`);
                        resolve(imagePath);
                    };
                    img.onerror = () => {
                        currentExtIndex++;
                        if (currentExtIndex >= imageInfo.extensions.length) {
                            currentExtIndex = 0;
                            currentIndex++;
                        }
                        tryNextImage();
                    };
                    img.src = imagePath;
                };
                
                tryNextImage();
            });
        } catch (error) {
            console.log(`Error loading local image for ${playerName}:`, error);
            return 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319000/319095.jpg';
        }
    }

    initializeUI() {
        this.updatePlayerDisplay();
        this.updateTeamButtons();
        this.updateTotalBudget();
        this.updateTeamsList();
        this.updateUpcomingPlayers();
        this.updateSummaryStats();
        this.addToHistory('Auction Started');
    }

    bindEvents() {
        // Team bid buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('team-btn')) {
                const teamName = e.target.textContent.replace(' (+)', '');
                this.placeBid(teamName);
            }
        });

        // Bid step buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('step-btn')) {
                document.querySelectorAll('.step-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentBidStep = parseInt(e.target.dataset.step);
            }
        });

        // Action buttons
        document.getElementById('skipPlayer').addEventListener('click', () => this.skipPlayer());
        document.getElementById('sellPlayer').addEventListener('click', () => this.sellPlayer());
        document.getElementById('useRTM').addEventListener('click', () => this.showRTMModal());
        
        // Prev button (second nav button)
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons.length > 1) {
            navButtons[1].addEventListener('click', () => this.prevPlayer());
        }
        
        // Reset button (last nav button)
        if (navButtons.length > 6) {
            navButtons[6].addEventListener('click', () => this.resetAuction());
        }

        // RTM Modal
        document.getElementById('rtmModal').addEventListener('click', (e) => {
            if (e.target.id === 'rtmModal' || e.target.classList.contains('close')) {
                this.closeRTMModal();
            }
        });

        document.getElementById('confirmRTM').addEventListener('click', () => this.confirmRTM());

        // Summary Modal
        document.getElementById('summaryModal').addEventListener('click', (e) => {
            if (e.target.id === 'summaryModal' || e.target.classList.contains('close')) {
                this.closeSummaryModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.currentBid > 0) {
                this.sellPlayer();
            } else if (e.key === 'Escape') {
                this.skipPlayer();
            } else if (e.key === 'ArrowRight') {
                this.nextPlayer();
            }
        });
    }

    initializeTheme() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Theme toggle button event
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.getElementById('themeIcon');
        
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    async updatePlayerDisplay() {
        if (this.currentPlayerIndex >= this.players.length) {
            this.showAuctionComplete();
            return;
        }

        const player = this.players[this.currentPlayerIndex];
        document.getElementById('playerName').textContent = player.name;
        document.getElementById('playerRole').textContent = player.role;
        document.getElementById('playerCountry').textContent = player.country;
        document.getElementById('playerBasePrice').textContent = `${player.basePrice} Cr`;
        document.getElementById('playerPreviousTeam').textContent = player.previousTeam;
        
        // Fetch local profile image for the player
        try {
            const localImage = await this.fetchLocalImage(player.name);
            document.getElementById('playerImage').src = localImage;
        } catch (error) {
            console.log(`Using default image for ${player.name}`);
            document.getElementById('playerImage').src = player.image;
        }
        
        // Update player statistics
        if (player.stats) {
            document.getElementById('playerMatches').textContent = player.stats.matches;
            document.getElementById('playerRuns').textContent = player.stats.runs;
            document.getElementById('playerWickets').textContent = player.stats.wickets;
            document.getElementById('playerAvg').textContent = player.stats.avg;
            document.getElementById('playerSR').textContent = player.stats.sr;
            document.getElementById('playerEcon').textContent = player.stats.econ;
            document.getElementById('lastSeason').textContent = player.stats.lastSeason;
            document.getElementById('playerExperience').textContent = player.stats.experience;
        }
        
        // Set base price as starting bid
        this.currentBid = player.basePrice; // Already in crores
        this.currentBidTeam = null;
        
        this.updateCurrentBid();
    }

    updateCurrentBid() {
        const bidAmount = this.currentBid > 0 ? `${this.formatNumber(this.currentBid)} Cr` : '2 Cr';
        const bidTeam = this.currentBidTeam ? this.currentBidTeam : 'No bids yet';
        
        document.getElementById('currentBidAmount').textContent = bidAmount;
        document.getElementById('currentBidTeam').textContent = bidTeam;
    }

    formatNumber(num) {
        // Remove unnecessary decimal places
        if (num % 1 === 0) {
            return num.toString();
        } else {
            return parseFloat(num.toFixed(1));
        }
    }

    updateTeamsList() {
        const teamsList = document.getElementById('teamsList');
        teamsList.innerHTML = '';

        this.teams.forEach(team => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            if (team.name === this.currentBidTeam) {
                teamItem.classList.add('highlighted');
            }

            teamItem.innerHTML = `
                <div class="team-name">${team.name}</div>
                <div class="team-budget">Budget: ₹${team.budget} Cr</div>
                <div class="team-players">Players: ${team.players.length} ${team.rtm ? '| RTM Available' : ''}</div>
            `;

            teamsList.appendChild(teamItem);
        });
        
        // Also update team players section
        this.updateTeamPlayersList();
    }

    updateTeamPlayersList() {
        const teamPlayersList = document.getElementById('teamPlayersList');
        teamPlayersList.innerHTML = '';

        this.teams.forEach(team => {
            if (team.players.length > 0) {
                const teamGroup = document.createElement('div');
                teamGroup.className = 'team-player-group';
                
                const teamHeader = document.createElement('h4');
                teamHeader.innerHTML = `
                    ${team.name} 
                    <span class="team-player-count">${team.players.length}</span>
                `;
                
                const playersList = document.createElement('div');
                playersList.className = 'team-player-list';
                
                team.players.forEach(player => {
                    const playerItem = document.createElement('div');
                    playerItem.className = 'team-player-item';
                    if (player.rtmUsed) {
                        playerItem.classList.add('team-player-rtm');
                    }
                    
                    playerItem.innerHTML = `
                        <span class="team-player-name">${player.name}</span>
                        <span class="team-player-price">₹${this.formatNumber(player.soldPrice)} Cr</span>
                    `;
                    
                    playersList.appendChild(playerItem);
                });
                
                teamGroup.appendChild(teamHeader);
                teamGroup.appendChild(playersList);
                teamPlayersList.appendChild(teamGroup);
            }
        });
    }

    updateLiveStats() {
        // Calculate live statistics
        const totalBids = this.biddingHistory.length;
        const soldPlayers = this.players.filter(p => p.status === 'sold');
        const totalSpent = soldPlayers.reduce((sum, p) => sum + p.soldPrice, 0);
        const averageBid = totalBids > 0 ? totalSpent / totalBids : 0;
        const highestBid = Math.max(...this.players.map(p => p.soldPrice || 0));
        const remainingBudget = this.teams.reduce((sum, t) => sum + t.budget, 0);

        // Update live stats display
        document.getElementById('currentBidCount').textContent = totalBids;
        document.getElementById('averageBidAmount').textContent = `₹${this.formatNumber(averageBid)} Cr`;
        document.getElementById('highestBidAmount').textContent = `₹${this.formatNumber(highestBid)} Cr`;
        document.getElementById('remainingBudget').textContent = `₹${this.formatNumber(remainingBudget)} Cr`;
    }

    addActivity(activity) {
        const activityList = document.getElementById('activityList');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = activity;
        
        // Add to top of list
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Keep only last 10 activities
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    updateTeamButtons() {
        const teamButtons = document.getElementById('teamButtons');
        teamButtons.innerHTML = '';

        const teamAbbreviations = ['CSK', 'MI', 'RCB', 'KKR', 'GT', 'LSG', 'RR', 'SRH', 'DC', 'PBKS'];
        
        teamAbbreviations.forEach(abbr => {
            const teamBtn = document.createElement('button');
            teamBtn.className = 'team-btn';
            teamBtn.textContent = `${abbr} (+)`;
            teamButtons.appendChild(teamBtn);
        });
    }

    updateTotalBudget() {
        const totalBudget = this.teams.reduce((sum, team) => sum + team.budget, 0);
        document.getElementById('totalBudget').textContent = totalBudget.toFixed(0);
    }

    placeBid(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        if (!team) return;

        const bidIncrement = this.currentBidStep / 100; // Convert lakhs to crores
        const newBid = parseFloat((this.currentBid + bidIncrement).toFixed(1));

        if (newBid > team.budget) {
            alert('Insufficient budget!');
            return;
        }

        this.currentBid = newBid;
        this.currentBidTeam = team.name;
        this.updateCurrentBid();
        this.updateTeamsList();
        this.addToHistory(`${team.name} → ${this.formatNumber(newBid)} Cr`, 'bid');
        this.addActivity(`${team.name} placed bid of ₹${this.formatNumber(newBid)} Cr`);
        this.updateLiveStats();

        // Add visual feedback
        document.querySelector('.bidding-status').classList.add('bid-animation');
        setTimeout(() => {
            document.querySelector('.bidding-status').classList.remove('bid-animation');
        }, 600);
    }

    sellPlayer() {
        if (this.currentBid === 0) {
            alert('No bids placed yet!');
            return;
        }

        const player = this.players[this.currentPlayerIndex];
        
        // Check if RTM is available for this player
        const previousTeam = this.teams.find(t => t.name === player.previousTeam);
        const hasRTM = previousTeam && previousTeam.rtm && previousTeam.budget >= this.currentBid;
        
        if (hasRTM) {
            this.showRTMConfirmation(player);
        } else {
            this.completeSale(player);
        }
    }

    showRTMConfirmation(player) {
        const rtmAmount = prompt(`RTM Available! ${player.previousTeam} can use RTM.\n\nDo you want to increase the bid amount for RTM?\nEnter additional amount in Crores (or 0 to keep current bid):`, "0");
        
        if (rtmAmount === null) {
            // User cancelled, complete sale normally
            this.completeSale(player);
            return;
        }
        
        const additionalAmount = parseFloat(rtmAmount) || 0;
        const newBidAmount = this.currentBid + additionalAmount;
        const previousTeam = this.teams.find(t => t.name === player.previousTeam);
        
        if (newBidAmount > previousTeam.budget) {
            alert(`Insufficient budget! ${player.previousTeam} only has ₹${previousTeam.budget} Cr available.`);
            this.completeSale(player);
            return;
        }
        
        // Ask the previous team if they want to use RTM
        const useRTM = confirm(`${player.previousTeam} - Do you want to use RTM for ${player.name} at ₹${this.formatNumber(newBidAmount)} Cr?\n\nClick OK to use RTM, Cancel to let the current bidder have the player.`);
        
        if (useRTM) {
            this.executeRTM(player, newBidAmount);
        } else {
            this.completeSale(player);
        }
    }

    executeRTM(player, bidAmount) {
        const previousTeam = this.teams.find(t => t.name === player.previousTeam);
        const currentTeam = this.teams.find(t => t.name === this.currentBidTeam);
        
        // Remove from current team if they had the highest bid
        if (currentTeam) {
            currentTeam.budget += this.currentBid;
        }
        
        // Add to previous team using RTM
        previousTeam.budget -= bidAmount;
        previousTeam.rtm = false; // RTM can only be used once
        previousTeam.players.push({
            ...player,
            soldPrice: bidAmount,
            sold: true,
            rtmUsed: true
        });

        // Mark player as sold
        player.sold = true;
        player.soldPrice = bidAmount;
        player.soldTo = previousTeam.name;
        player.rtmUsed = true;

        // Update totals
        this.totalSpent += bidAmount;
        this.addToHistory(`RTM USED: ${player.name} retained by ${previousTeam.name} for ${this.formatNumber(bidAmount)} Cr`, 'sold');
        this.addActivity(`RTM USED: ${player.name} retained by ${previousTeam.name} for ₹${this.formatNumber(bidAmount)} Cr`);
        this.updateLiveStats();

        // Visual feedback
        document.querySelector('.player-card').classList.add('sold-animation');
        
        setTimeout(() => this.nextPlayer(), 1000);

        this.updateTotalBudget();
        this.updateTeamsList();
        this.updateSummaryStats();
    }

    completeSale(player) {
        const team = this.teams.find(t => t.name === this.currentBidTeam);

        // Deduct budget and add player
        team.budget -= this.currentBid;
        team.players.push({
            ...player,
            soldPrice: this.currentBid,
            sold: true
        });

        // Mark player as sold
        player.sold = true;
        player.soldPrice = this.currentBid;
        player.soldTo = team.name;

        // Update totals
        this.totalSpent += this.currentBid;
        this.addToHistory(`SOLD: ${player.name} to ${team.name} for ${this.formatNumber(this.currentBid)} Cr`, 'sold');
        this.addActivity(`SOLD: ${player.name} to ${team.name} for ₹${this.formatNumber(this.currentBid)} Cr`);
        this.updateLiveStats();

        // Visual feedback
        document.querySelector('.player-card').classList.add('sold-animation');
        
        setTimeout(() => this.nextPlayer(), 1000);

        this.updateTotalBudget();
        this.updateTeamsList();
        this.updateSummaryStats();
    }

    shouldShowRTM(player) {
        // Show RTM if the player's previous team has RTM available and wants to use it
        const previousTeam = this.teams.find(t => t.name === player.previousTeam);
        return previousTeam && previousTeam.rtm && previousTeam.budget >= this.currentBid;
    }

    confirmRTM() {
        const selectedRTM = document.querySelector('.rtm-team.selected');
        if (!selectedRTM) {
            alert('Please select a team for RTM!');
            return;
        }

        const player = this.players[this.currentPlayerIndex];
        const rtmTeam = this.teams.find(t => t.name === player.previousTeam);
        
        // Remove player from current team and add to RTM team
        const currentTeam = this.teams.find(t => t.name === this.currentBidTeam);
        currentTeam.players.pop();
        currentTeam.budget += this.currentBid;
        
        rtmTeam.budget -= this.currentBid;
        rtmTeam.rtm = false; // RTM can only be used once
        rtmTeam.players.push({
            ...player,
            soldPrice: this.currentBid,
            sold: true,
            rtmUsed: true
        });

        player.soldTo = rtmTeam.name;
        player.rtmUsed = true;

        this.closeRTMModal();
        this.updateTeamsDisplay();
        this.nextPlayer();
    }

    closeRTMModal() {
        document.getElementById('rtmModal').style.display = 'none';
    }

    prevPlayer() {
        if (this.currentPlayerIndex > 0) {
            this.currentPlayerIndex--;
            this.currentBid = 0;
            this.currentBidTeam = null;
            
            document.querySelector('.player-card').classList.remove('sold-animation');
            this.updatePlayerDisplay();
            this.updateTeamsList();
        }
    }

    skipPlayer() {
        const player = this.players[this.currentPlayerIndex];
        this.addToHistory(`SKIPPED: ${player.name} (No bids)`, 'info');
        this.nextPlayer();
    }

    nextPlayer() {
        this.currentPlayerIndex++;
        this.currentBid = 0;
        this.currentBidTeam = null;
        
        document.querySelector('.player-card').classList.remove('sold-animation');
        this.updatePlayerDisplay();
        this.updateTeamsList();
        this.updateUpcomingPlayers();
        this.updateSummaryStats();
    }

    addToHistory(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}-entry`;
        logEntry.textContent = message;
        
        const biddingLog = document.getElementById('biddingLog');
        biddingLog.appendChild(logEntry);
        
        // Auto-scroll to bottom
        biddingLog.scrollTop = biddingLog.scrollHeight;
        
        // Keep only last 20 entries
        const entries = biddingLog.querySelectorAll('.log-entry');
        if (entries.length > 20) {
            entries[0].remove();
        }
    }

    async updateUpcomingPlayers() {
        const upcomingList = document.getElementById('upcomingList');
        upcomingList.innerHTML = '';

        const nextPlayers = this.players.slice(this.currentPlayerIndex + 1, this.currentPlayerIndex + 4);
        
        for (let index = 0; index < nextPlayers.length; index++) {
            const player = nextPlayers[index];
            const playerDiv = document.createElement('div');
            playerDiv.className = `upcoming-player ${index === 0 ? 'next' : ''}`;
            
            // Fetch player image
            try {
                const playerImage = await this.fetchLocalImage(player.name);
                playerDiv.innerHTML = `
                    <div class="upcoming-player-content">
                        <img src="${playerImage}" alt="${player.name}" class="upcoming-player-image" onerror="this.src='https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319000/319095.jpg'">
                        <div class="upcoming-player-info">
                            <div class="upcoming-player-name">${player.name}</div>
                            <div class="upcoming-player-details">
                                ${player.role} • ${player.basePrice}L • ${player.previousTeam}
                            </div>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.log(`Using default image for upcoming player ${player.name}`);
                playerDiv.innerHTML = `
                    <div class="upcoming-player-content">
                        <img src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319000/319095.jpg" alt="${player.name}" class="upcoming-player-image">
                        <div class="upcoming-player-info">
                            <div class="upcoming-player-name">${player.name}</div>
                            <div class="upcoming-player-details">
                                ${player.role} • ${player.basePrice}L • ${player.previousTeam}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            upcomingList.appendChild(playerDiv);
        }
    }

    updateSummaryStats() {
        const totalSold = this.players.filter(p => p.sold).length;
        const totalUnsold = this.players.filter(p => !p.sold && this.players.indexOf(p) < this.currentPlayerIndex).length;
        
        document.getElementById('totalSold').textContent = totalSold;
        document.getElementById('totalUnsold').textContent = totalUnsold;
        document.getElementById('totalSpent').textContent = `₹${this.formatNumber(this.totalSpent)} Cr`;
    }

    resetAuction() {
        if (confirm('Are you sure you want to reset the entire auction? This will clear all progress.')) {
            // Reset all players
            this.players.forEach(player => {
                player.sold = false;
                player.soldPrice = 0;
                player.soldTo = null;
                player.rtmUsed = false;
            });
            
            // Reset teams
            this.teams.forEach(team => {
                team.budget = 100;
                team.players = [];
                team.rtm = true;
            });
            
            // Reset auction state
            this.currentPlayerIndex = 0;
            this.currentBid = 0;
            this.currentBidTeam = null;
            this.selectedTeam = null;
            this.totalSpent = 0;
            this.biddingHistory = [];
            
            // Clear bidding log
            const biddingLog = document.getElementById('biddingLog');
            biddingLog.innerHTML = '<div class="log-entry">Auction Reset</div>';
            
            // Update all displays
            this.updatePlayerDisplay();
            this.updateTeamButtons();
            this.updateTotalBudget();
            this.updateTeamsList();
            this.updateUpcomingPlayers();
            this.updateSummaryStats();
            
            // Reset bid step to default
            document.querySelectorAll('.step-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.step-btn[data-step="10"]').classList.add('active');
            this.currentBidStep = 10;
            
            this.addToHistory('Auction Reset - Starting Fresh');
        }
    }

    showRTMModal() {
        const player = this.players[this.currentPlayerIndex];
        if (!this.shouldShowRTM(player)) {
            alert('RTM not available for this player!');
            return;
        }
        
        const modal = document.getElementById('rtmModal');
        const rtmTeams = document.getElementById('rtmTeams');
        
        rtmTeams.innerHTML = '';
        
        const previousTeam = this.teams.find(t => t.name === player.previousTeam);
        if (previousTeam && previousTeam.rtm) {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'rtm-team';
            teamDiv.innerHTML = `
                <div class="team-name">${previousTeam.name}</div>
                <div class="team-budget">Budget: ₹${previousTeam.budget} Cr</div>
                <div class="team-budget">Required: ₹${this.currentBid} Cr</div>
            `;
            teamDiv.addEventListener('click', () => {
                document.querySelectorAll('.rtm-team').forEach(t => t.classList.remove('selected'));
                teamDiv.classList.add('selected');
            });
            rtmTeams.appendChild(teamDiv);
        }
        
        modal.style.display = 'block';
    }

    showAuctionComplete() {
        const modal = document.getElementById('summaryModal');
        const summary = document.getElementById('auctionSummary');
        
        let summaryHTML = '<h4>Final Results:</h4>';
        
        this.teams.forEach(team => {
            summaryHTML += `
                <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <h5>${team.name}</h5>
                    <p>Remaining Budget: ₹${team.budget} Cr</p>
                    <p>Players Bought: ${team.players.length}</p>
                    <div style="margin-top: 10px;">
                        ${team.players.map(p => `<span style="background: #e9ecef; padding: 5px 10px; margin: 2px; border-radius: 15px; display: inline-block;">${p.name} (₹${p.soldPrice} Cr)</span>`).join('')}
                    </div>
                </div>
            `;
        });
        
        summary.innerHTML = summaryHTML;
        modal.style.display = 'block';
    }

    closeSummaryModal() {
        document.getElementById('summaryModal').style.display = 'none';
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new IPLAuction();
});
