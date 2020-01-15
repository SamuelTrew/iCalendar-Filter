import React from 'react';
import './App.css';
import CalFilter from './iCal-filter'

const App: React.FC = () => {
   return (
      <div className="App">
         <header>
            <CalFilter/>
         </header>
      </div>
   );
};


export default App;
