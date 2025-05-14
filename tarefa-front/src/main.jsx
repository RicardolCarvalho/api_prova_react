// main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'

const domain   = 'dev-vlbhbshl7b1pxe8e.us.auth0.com'
const clientId = 'eo8WNkaTwrcGujuCMSkRZG3yMYuQvXTy'

const audience = 'https://dev-vlbhbshl7b1pxe8e.us.auth0.com/api/v2/'

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      audience,
      scope: 'openid profile email read:tasks create:tasks delete:tasks',
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>
)
