const BarberCard = ({ barber, onView }) => {
  const avatar = barber.avatar || barber.emoji || '✂️';
  const spotsLeft = barber.availability?.spotsLeft;

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-white/10 bg-ink-raised transition-all duration-300 hover:-translate-y-1 hover:border-amber/40">
      <div className="fade-sheen card-cover">
        <span className="avatar-ring transition-transform duration-300 group-hover:scale-105">{avatar}</span>
      </div>

      <div className="flex flex-1 flex-col p-5 text-left">
        <h3 className="font-display text-xl font-medium uppercase leading-tight tracking-tight text-towel">
          {barber.name}
        </h3>
        <p className="mt-1 text-sm text-silver">{barber.specialty}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-silver">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rotate-45 bg-amber" aria-hidden="true" />
            {barber.location}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rotate-45 bg-amber" aria-hidden="true" />
            ★ {barber.rating} ({barber.totalReviews})
          </span>
          {barber.experience && (
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rotate-45 bg-amber" aria-hidden="true" />
              {barber.experience}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {spotsLeft !== undefined && (
            <span className="meta-tag">
              <span className={`h-1.5 w-1.5 rounded-full ${spotsLeft > 0 ? 'bg-amber' : 'bg-silver'}`} aria-hidden="true" />
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Busy'}
            </span>
          )}
          {barber.badges?.slice(0, 1).map((badge) => (
            <span key={badge} className="meta-tag border-amber/30 text-amber/90">
              {badge}
            </span>
          ))}
        </div>

        <button onClick={() => onView(barber.id)} className="btn-primary mt-5 w-full">
          {barber.buttonText || 'View Profile'}
        </button>
      </div>
    </article>
  );
};

export default BarberCard;