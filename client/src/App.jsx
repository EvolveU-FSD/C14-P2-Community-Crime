import { useState } from 'react'
import './App.css'
import CrimeDataDisplay from './components/CrimeDataDisplay'

function App() {
  return (
    <>
      <h1>Hello Alia</h1>
      <p>Here's your starting page for the map</p>

      <br />

      <h2>Also here's the API data we can play with!</h2>
      <CrimeDataDisplay />
    </>
  )
}

export default App
