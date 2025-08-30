# Silent Spiral 12D - Installation Guide

## Overview

This guide provides comprehensive installation instructions for the Silent Spiral 12D mathematical visualization system. The project includes all dependencies in the running pipeline with automated setup and validation.

## System Requirements

### Minimum Requirements
- **Node.js**: >= 14.0.0 (Recommended: Latest LTS)
- **npm**: >= 6.0.0 (Included with Node.js)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB for project + dependencies
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

### Hardware Requirements
- **Graphics**: WebGL 2.0 capable GPU
- **CPU**: Modern multi-core processor (Intel i5/AMD Ryzen 5 or better)
- **Network**: Internet connection for dependency downloads

### Browser Compatibility
| Browser | Minimum Version | WebGL Support | Notes |
|---------|----------------|---------------|-------|
| Chrome | 80+ | ✅ WebGL 2.0 | Recommended |
| Firefox | 75+ | ✅ WebGL 2.0 | Full support |
| Safari | 13+ | ✅ WebGL 2.0 | macOS/iOS only |
| Edge | 80+ | ✅ WebGL 2.0 | Chromium-based |

## Installation Methods

### Method 1: Automated Installation (Recommended)

The automated installer handles all setup tasks with comprehensive validation.

```bash
# 1. Clone the repository
git clone [repository-url]
cd silent-spiral-12d

# 2. Run automated installer
node install.js
```

**Automated installer features:**
- ✅ System requirements validation
- ✅ Package.json validation
- ✅ Dependency installation with error handling
- ✅ Security vulnerability scanning
- ✅ Development server testing
- ✅ Installation report generation
- ✅ Troubleshooting guidance

**Expected output:**
```
   _____ _ _            _     _____       _           _ 
  |   __| | | ___ ___ _| |   |   __|___ |_|___ ___ | |
  |__   | | | | -_|   | |   |__   | . || |  _| .'|| |
  |_____|_|___|___|_|_| |   |_____|  _||_|_| |__,||_|
                      |_|          |_|              
  
  Silent Spiral 12D - Automated Installation

============================================================
CHECKING SYSTEM REQUIREMENTS
============================================================
✅ Node.js v20.x.x (✓ >= 14.0.0 required)
✅ npm 10.x.x (✓ >= 6.0.0 required)

============================================================
INSTALLING DEPENDENCIES  
============================================================
✅ Dependencies installed successfully
...
🎉 INSTALLATION COMPLETED SUCCESSFULLY!
```

### Method 2: Manual Installation

For advanced users or custom setups:

```bash
# 1. Clone repository
git clone [repository-url]
cd silent-spiral-12d

# 2. Install dependencies
npm install

# 3. Optional: Check for vulnerabilities
npm audit

# 4. Test installation
npm run dev
```

### Method 3: Alternative Package Managers

**Using Yarn:**
```bash
yarn install
yarn dev
```

**Using pnpm:**
```bash
pnpm install
pnpm dev
```

## Dependency Details

### Production Dependencies

#### three.js (^0.158.0)
- **Size**: ~600KB minified
- **Purpose**: WebGL-based 3D graphics rendering
- **License**: MIT
- **Critical**: Yes - Core visualization engine

#### dat.gui (^0.7.9)
- **Size**: ~50KB minified  
- **Purpose**: Real-time parameter controls
- **License**: Apache-2.0
- **Critical**: Yes - User interface

#### ml-pca (^4.1.1)
- **Size**: ~30KB minified
- **Purpose**: Principal Component Analysis for dimensionality reduction
- **License**: MIT
- **Critical**: Yes - Mathematical core

### Development Dependencies

#### vite (^4.0.0)
- **Purpose**: Development server and build system
- **Features**: Hot reload, ES modules, production builds
- **License**: MIT
- **Usage**: Development only

## Installation Verification

### 1. Check Dependencies
```bash
npm list --depth=0
```

Expected output:
```
silent-spiral-12d@1.0.0
├── dat.gui@0.7.9
├── ml-pca@4.1.1
├── three@0.158.0
└── vite@4.5.14
```

### 2. Test Development Server
```bash
npm run dev
```

Expected output:
```
VITE v4.5.14  ready in 330 ms
➜  Local:   http://localhost:5173/
```

### 3. Verify WebGL Support
1. Open http://localhost:5173 in browser
2. Check for 3D visualization
3. Confirm GUI controls are responsive
4. Test preset selection

## Troubleshooting

### Common Issues

#### Issue: "Module not found" errors
**Cause**: Missing or corrupted dependencies
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "WebGL not supported"
**Cause**: Browser or graphics card compatibility
**Solutions**:
- Update browser to latest version
- Enable hardware acceleration in browser settings
- Update graphics drivers
- Try different browser

#### Issue: "EADDRINUSE: Port 5173 already in use"
**Cause**: Port conflict with existing process
**Solutions**:
```bash
# Kill process using port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

#### Issue: npm audit vulnerabilities
**Cause**: Security vulnerabilities in dependencies
**Assessment**: Most vulnerabilities are in development dependencies only
**Solutions**:
```bash
# Review vulnerabilities
npm audit

# Auto-fix non-breaking issues
npm audit fix

# Force fix all issues (may cause breaking changes)
npm audit fix --force
```

#### Issue: Installation fails on Windows
**Cause**: Path length limitations, permission issues
**Solutions**:
- Run Command Prompt as Administrator
- Use shorter directory path
- Enable long path support in Windows

#### Issue: Performance issues
**Cause**: Hardware limitations, too many points
**Solutions**:
- Reduce point count in Advanced Settings
- Close other browser tabs
- Update graphics drivers
- Try lower resolution display

### System-Specific Notes

#### Windows
- Use Command Prompt or PowerShell as Administrator
- Windows Subsystem for Linux (WSL) compatible
- May require Visual Studio Build Tools for some dependencies

#### macOS
- Xcode Command Line Tools required: `xcode-select --install`
- Use Terminal or iTerm2
- Homebrew recommended for Node.js installation

#### Linux
- Use distribution package manager for Node.js
- Build tools required: `sudo apt-get install build-essential`
- May need to install additional graphics libraries

## Security Considerations

### Current Vulnerabilities (2025-08-30)
- **vite**: Uses esbuild with moderate vulnerability
- **Impact**: Development server only, not production runtime
- **Risk Level**: Low (development-only dependency)

### Security Best Practices
1. Keep dependencies updated: `npm update`
2. Regular security audits: `npm audit`
3. Use package-lock.json for reproducible installs
4. Pin versions in production deployments

## Performance Optimization

### Bundle Size Analysis
```bash
# Build for production
npm run build

# Analyze bundle size
npx vite-bundle-analyzer dist
```

### Runtime Performance
- **Memory usage**: 50-500MB (depends on point count)
- **GPU usage**: Hardware-accelerated WebGL rendering
- **CPU usage**: Minimal (GPU-accelerated)
- **Network**: Single bundle download, no runtime requests

## File Structure After Installation

```
silent-spiral-12d/
├── node_modules/           # Installed dependencies
├── src/                   # Source code
│   ├── config.js         # Configuration management
│   ├── spiral.js         # Mathematical engine
│   ├── controls.js       # User interface
│   ├── visualization.js  # 3D rendering
│   └── projection.js     # Dimensionality reduction
├── docs/                 # Documentation
├── local-reports/        # Analysis reports (git-ignored)
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── requirements.txt     # Complete requirements documentation
├── install.js          # Automated installation script
├── installation-report.json  # Installation results
└── README.md           # Main documentation
```

## Development Workflow

### Available Scripts
```bash
npm run dev      # Start development server (localhost:5173)
npm run build    # Build for production
npm run serve    # Preview production build
```

### Development Server Features
- ⚡ Hot Module Replacement (HMR)
- 📦 ES modules support  
- 🔧 Source maps for debugging
- 📱 Mobile device testing via network

## Next Steps

After successful installation:

1. **Start development server**: `npm run dev`
2. **Open browser**: Navigate to http://localhost:5173
3. **Explore presets**: Use dropdown menu to try different configurations
4. **Read documentation**: 
   - [Architecture Guide](ARCHITECTURE.md) - Technical implementation
   - [API Reference](API.md) - Complete API documentation
5. **Experiment**: Adjust parameters and observe mathematical patterns

## Support

For installation issues:

1. **Check requirements.txt**: Comprehensive troubleshooting guide
2. **Review installation-report.json**: Detailed installation results
3. **Visit documentation**: Technical implementation details
4. **GitHub Issues**: Community support and bug reports

## Contributing

To set up development environment:

```bash
# Install all dependencies
npm install

# Install development tools (optional)
npm install -g nodemon      # Auto-restart server
npm install -g http-server  # Alternative server

# Start development
npm run dev
```

Development contributions welcome for:
- Additional mathematical systems
- Performance optimizations
- User interface improvements
- Testing framework
- Documentation updates