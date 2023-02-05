import ReactDOM from 'react-dom/client';
import AuthWrapper from './components/auth-wrapper/auth-wrapper';
import './index.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <AuthWrapper />
);
