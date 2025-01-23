import { useMount } from 'ahooks'
import { RouterProvider } from 'react-router-dom'
import router from '@/router'
import { Suspense } from 'react'
import Loading from './layout/loading'
import { MeetingsProvider } from '@/context/MeetingsContext'
import { AppProvider } from '@/context/AppContext'
import { LanguageProvider } from '@/context/LanguageContext'
import './App.css'
import './App.scss'

const App = () => {
  useMount(() => {
    console.log('App mounted')
  })
  return (
    <LanguageProvider>
      <AppProvider>
        <MeetingsProvider>
          <Suspense fallback={<Loading />}>
            <RouterProvider router={router} />
          </Suspense>
        </MeetingsProvider>
      </AppProvider>
    </LanguageProvider>
  )
}

export default App
