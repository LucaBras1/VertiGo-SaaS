import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary-dark text-white">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Chystáte akci pro děti?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Pozvěte nás k vám a přivezeme vám pohádku. Vyberte si z repertoáru
            a do 24 hodin vám pošleme nabídku na míru.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/repertoar"
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-neutral-100"
            >
              Prohlédnout představení
            </Button>
            <Button
              href="/cenik"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Kolik to stojí?
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
