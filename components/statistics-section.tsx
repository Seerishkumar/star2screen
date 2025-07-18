export function StatisticsSection() {
  const stats = [
    { value: "700,000+", label: "Buyers Associated", color: "bg-accent-blue" },
    { value: "250,000+", label: "Sellers Associated", color: "bg-accent-green" },
    { value: "425+", label: "Developer Partnered", color: "bg-accent-purple" },
    { value: "200+", label: "Companies Partnered", color: "bg-accent-red" },
    { value: "5,720+", label: "Support Empowered", color: "bg-accent-gold" },
  ]

  return (
    <section className="bg-white py-12">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center">
              <div className={`${stat.color} text-white rounded-full w-16 h-16 flex items-center justify-center mb-3`}>
                <span className="text-xl font-bold">{stat.value.split("+")[0].slice(-2)}</span>
              </div>
              <div className="text-2xl font-bold md:text-3xl text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
