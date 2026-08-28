export const StarFilled = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#facc15">
    <path d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.7 7.3L12 18l-6.4 3.7 1.7-7.3-5.7-4.9 7.5-.6L12 2z"/>
  </svg>
);

export const StarHalf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="halfGrad">
        <stop offset="50%" stopColor="#facc15"/>
        <stop offset="50%" stopColor="#e5e7eb"/>
      </linearGradient>
    </defs>
    <path
      d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.7 7.3L12 18l-6.4 3.7 1.7-7.3-5.7-4.9 7.5-.6L12 2z"
      fill="url(#halfGrad)"
    />
  </svg>
);

export const StarEmpty = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#e5e7eb">
    <path d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.7 7.3L12 18l-6.4 3.7 1.7-7.3-5.7-4.9 7.5-.6L12 2z"/>
  </svg>
);


export default{StarFilled, StarEmpty, StarHalf}