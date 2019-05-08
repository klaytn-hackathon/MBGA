import React from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import Login from 'components/Login'

const renderRoutes = rootComponent => (
  <Router history={browserHistory}>
    <Route component={rootComponent}>
      <Route path="/" component={Login} />
    </Route>
  </Router>
)

export default renderRoutes
