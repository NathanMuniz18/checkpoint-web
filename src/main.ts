import './styles/global.css';
import { route } from './router';

window.addEventListener('hashchange', route);
window.addEventListener('authchange', route);
if (!location.hash) history.replaceState(null, '', '#/');
void route();
