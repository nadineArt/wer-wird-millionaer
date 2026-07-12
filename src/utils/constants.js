export const COLLECTIONS = {
  CONFIG: 'config',
  GAMES: 'games',
  SESSIONS: 'sessions',
};

export const CONFIG_DOC = 'appConfig';

export const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
};

export const QUESTION_STATE = {
  WAITING: 'waiting_answers',
  REVEALED: 'revealed',
};

export const PLAYER_STATUS = {
  ACTIVE: 'active',
  ELIMINATED: 'eliminated',
  WINNER: 'winner',
};

export const JOKER_TYPES = {
  FIFTY: 'fifty',
  PHONE: 'phone',
  AUDIENCE: 'audience',
};

export const ANSWERS = ['A', 'B', 'C', 'D'];

export const STORAGE_KEYS = {
  PLAYER_ID: 'wwm_player_id',
  SESSION_ID: 'wwm_session_id',
  PLAYER_ACCESS: 'wwm_player_access',
  ADMIN_AUTH: 'wwm_admin_auth',
};

export const DEFAULT_PASSWORDS = {
  PLAYER: 'WWM',
  ADMIN: 'admin',
};
