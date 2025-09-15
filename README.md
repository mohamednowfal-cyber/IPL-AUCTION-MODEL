# IPL Auction Application 2024

A comprehensive web-based IPL Auction simulation application that allows teams to bid on players with realistic auction mechanics.

## Features

### 🏏 Player Management
- Complete player database with detailed information
- Player details include role, country, base price, and previous team
- High-quality player images and visual presentation
- Sequential player presentation based on predefined order

### 💰 Bidding System
- **Three bid increments**: ₹10 Lakhs, ₹20 Lakhs, and ₹1 Crore
- Real-time bid tracking with current highest bidder
- Budget validation to prevent overspending
- Visual feedback for bid placements

### 🏆 Team Management
- **10 IPL Teams** with individual budgets (₹100 Crores each)
- Real-time budget tracking and remaining balance display
- Player purchase history for each team
- Team selection interface for bidding

### ⚡ Selling Mechanism
- **Highest bidder wins** the player
- **Skip option** available for any player
- Automatic budget deduction upon purchase
- Visual confirmation of successful sales

### 🔄 Right to Match (RTM)
- Teams can use RTM to retain their previous players
- RTM can only be used once per team
- Automatic budget management for RTM usage
- Modal interface for RTM confirmation

### 🎨 User Experience
- **Modern, responsive design** with IPL-themed aesthetics
- **Keyboard shortcuts** for quick actions:
  - `Enter`: Sell current player
  - `Escape`: Skip current player
  - `Arrow Right`: Next player
- **Smooth animations** and visual feedback
- **Mobile-responsive** layout

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start the auction!

### File Structure
```
IPL/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript application logic
└── README.md          # Project documentation
```

## How to Use

### Starting the Auction
1. Open the application in your browser
2. The first player will be displayed automatically
3. Select a team from the teams panel on the right

### Bidding Process
1. **Select a team** by clicking on their card
2. **Place bids** using the increment buttons:
   - +₹10L: Add 10 lakhs to current bid
   - +₹20L: Add 20 lakhs to current bid
   - +₹1Cr: Add 1 crore to current bid
3. **Sell the player** when satisfied with the highest bid
4. **Skip the player** if no team wants to bid

### Right to Match (RTM)
1. When a player is sold, RTM option appears if applicable
2. Previous team can match the highest bid
3. RTM can only be used once per team
4. Budget is automatically adjusted

### Navigation
- **Next Player**: Move to the next player in the list
- **Skip Player**: Skip current player without selling
- **Sell Player**: Sell to highest bidder

## Technical Features

### Responsive Design
- **Desktop**: Full two-column layout with player and team sections
- **Tablet**: Stacked layout with grid-based team display
- **Mobile**: Single-column layout with optimized touch interactions

### Performance
- **Lightweight**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Fast loading**: Optimized images and minimal dependencies
- **Smooth animations**: CSS-based animations for better performance

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Adding More Players
Edit the `players` array in `script.js`:
```javascript
{
    name: 'Player Name',
    role: 'Batsman/Bowler/All Rounder/Wicket Keeper',
    country: 'Country',
    basePrice: 1.5, // in crores
    previousTeam: 'Team Abbreviation',
    image: 'image-url',
    sold: false
}
```

### Modifying Teams
Edit the `teams` array in `script.js`:
```javascript
{
    name: 'Team Name',
    budget: 100, // in crores
    players: [],
    rtm: true,
    color: '#hex-color'
}
```

### Styling Customization
- **Colors**: Modify CSS custom properties in `styles.css`
- **Layout**: Adjust grid and flexbox properties
- **Animations**: Customize keyframe animations

## Future Enhancements

- [ ] Player statistics and performance data
- [ ] Auction history and analytics
- [ ] Multi-round auction support
- [ ] Team formation and strategy tools
- [ ] Export/import auction data
- [ ] Real-time multiplayer support
- [ ] Advanced RTM rules and conditions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions, issues, or feature requests, please open an issue in the repository.

---

**Enjoy the IPL Auction Experience! 🏏⚡**
