import Loader from '@/components/Loader/Loader'
import Stage from '@/components/Stage/Stage'
import OwnerSection from '@/components/Owner/OwnerSection'

export default function Home() {
  return (
    <>
      <Loader />
      <Stage />
      <OwnerSection />
    </>
  )
}
