import Image from 'next/image'

export function Header() {
  return (
    <header className="py-5 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex justify-center">
        <Image
          src="/logo.png"
          alt="Ragado Brokers"
          width={170}
          height={50}
          priority
        />
      </div>
    </header>
  )
}
