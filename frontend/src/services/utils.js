/**
 * Extracts the 11-character YouTube ID from a variety of URL formats.
 * e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ -> dQw4w9WgXcQ
 */
export const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Returns the default route for a user based on their platform role.
 */
export const getDashboardPath = (role) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'student': return '/student';
    case 'expert': return '/expert';
    case 'interviewer': return '/interviewer';
    default: return '/login';
  }
};