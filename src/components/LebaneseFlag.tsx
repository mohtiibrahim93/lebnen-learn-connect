export const LebaneseFlag = () => {
  return (
    <div className="w-full max-w-[450px] h-auto rounded-xl shadow-elevated overflow-hidden transform hover:rotate-0 rotate-[-3deg] transition-transform duration-500">
      <svg className="w-full h-auto" viewBox="0 0 12 8">
        {/* Top Red Stripe */}
        <rect width="12" height="2" y="0" fill="#ED1C24"/> 
        
        {/* White Stripe (Middle 1/2) */}
        <rect width="12" height="4" y="2" fill="#FFFFFF"/>
        
        {/* Bottom Red Stripe */}
        <rect width="12" height="2" y="6" fill="#ED1C24"/>
        
        {/* Cedar (Green) - Centered in the middle white band */}
        <g transform="translate(6, 4) scale(1.4)">
          <path 
            d="M 0, -1.0 L 0.4, -0.4 L 0.25, -0.4 L 0.6, 0 L 0.4, 0 L 0.8, 0.4 L 0.6, 0.4 L 1.0, 0.8 L 0, 0.8 Z M 0, -1.0 L -0.4, -0.4 L -0.25, -0.4 L -0.6, 0 L -0.4, 0 L -0.8, 0.4 L -0.6, 0.4 L -1.0, 0.8 L 0, 0.8 Z" 
            fill="#009A44"
          />
          <rect x="-0.15" y="0.8" width="0.3" height="0.4" fill="#805000"/>
        </g>
      </svg>
    </div>
  );
};
