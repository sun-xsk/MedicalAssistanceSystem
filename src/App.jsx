import { useRoutes } from 'react-router-dom'
import { fullScreen } from '@/util/js'
import routes from './routes/routes'

function App() {
  const router = useRoutes(routes)
  document.addEventListener('dblclick', async (key) => {
    if (!document.fullscreenElement) {
      fullScreen();
    } else {
      await document.exitFullscreen();
    }
  })

  return (
    <div className="App">
      {router}
    </div>
  )
}

export default App
