<svg width="800" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#f7971e"/>
      <stop offset="50%"  stop-color="#ffd200"/>
      <stop offset="100%" stop-color="#f7971e"/>
    </linearGradient>
    <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#ff6ec4"/>
      <stop offset="100%" stop-color="#7873f5"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softglow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="200" rx="18" fill="#0d0d1a"/>

  <!-- Subtle animated dots -->
  <circle cx="60"  cy="30"  r="2" fill="#ffd200" opacity="0.4">
    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="740" cy="170" r="2" fill="#ff6ec4" opacity="0.4">
    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="400" cy="15"  r="1.5" fill="#7873f5" opacity="0.5">
    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="150" cy="180" r="1.5" fill="#ffd200" opacity="0.5">
    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="650" cy="25"  r="1.5" fill="#ff6ec4" opacity="0.4">
    <animate attributeName="opacity" values="0.1;0.7;0.1" dur="2.4s" repeatCount="indefinite"/>
  </circle>

  <!-- Floating group for main title -->
  <g filter="url(#softglow)">
    <animateTransform attributeName="transform" type="translate"
      values="0,0; 0,-10; 0,0" dur="3s" repeatCount="indefinite" calcMode="spline"
      keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"/>

    <!-- Shadow/echo text -->
    <text x="400" y="105" text-anchor="middle"
      font-family="Georgia, serif" font-size="52" font-weight="900"
      fill="#ffd200" opacity="0.08" letter-spacing="6">
      𝗔𝗔𝗦𝗛𝗜𝗙-𝗠𝗗
    </text>

    <!-- Main title -->
    <text x="400" y="100" text-anchor="middle"
      font-family="Georgia, serif" font-size="52" font-weight="900"
      fill="url(#goldGrad)" filter="url(#glow)" letter-spacing="6">
      𝗔𝗔𝗦𝗛𝗜𝗙-𝗠𝗗
    </text>
  </g>

  <!-- Subtitle floating with slight delay -->
  <g>
    <animateTransform attributeName="transform" type="translate"
      values="0,0; 0,-7; 0,0" dur="3s" begin="0.4s" repeatCount="indefinite" calcMode="spline"
      keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"/>

    <text x="400" y="148" text-anchor="middle"
      font-family="Georgia, serif" font-size="20" font-weight="400" font-style="italic"
      fill="url(#pinkGrad)" filter="url(#glow)" letter-spacing="4" opacity="0.95">
      𝐁𝐘  𝐀𝐀𝐒𝐇𝐈𝐅  𝐒𝐄𝐑  ♥️
    </text>
  </g>

  <!-- Decorative lines -->
  <line x1="80" y1="120" x2="290" y2="120" stroke="url(#goldGrad)" stroke-width="1" opacity="0.4">
    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite"/>
  </line>
  <line x1="510" y1="120" x2="720" y2="120" stroke="url(#goldGrad)" stroke-width="1" opacity="0.4">
    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite"/>
  </line>

  <!-- Corner decorations -->
  <text x="25"  y="45"  font-size="18" fill="#ffd200" opacity="0.5">✦</text>
  <text x="755" y="45"  font-size="18" fill="#ffd200" opacity="0.5">✦</text>
  <text x="25"  y="180" font-size="18" fill="#ff6ec4" opacity="0.5">✦</text>
  <text x="755" y="180" font-size="18" fill="#ff6ec4" opacity="0.5">✦</text>
</svg>


<div align="center">

<img src="https://raw.githubusercontent.com/nonxe/a1/main/aashif-banner.svg" width="800" alt="AASHIF-MD BY AASHIF SER"/>

</div>

---

<div align="center">

### 🌟 Welcome to **AASHIF-MD** 🌟

*A powerful WhatsApp Bot made with ❤️ by **Aashif Ser***

</div>

--- 



## For HEROKU DEPLOYMENT

<a href="https://signup.heroku.com/login"><img src="https://img.shields.io/badge/HEROKU%20SIGNUP-white" alt="Heroku Signup" width="150"></a>
  
<a href="https://dashboard.heroku.com/new?template=https://github.com/nonxe/a1"><img src="https://img.shields.io/badge/DEPLOY%20NOW-red" alt="Deploy on Heroku" width="150"></a>

## For Localhost or Panel
<a href="https://github.com/nonxe/a1/archive/refs/heads/main.zip">
  <img src="https://img.shields.io/badge/⬇️ Download ZIP-Click Here-brightgreen?style=for-the-badge" alt="Download ZIP"/>
</a>
