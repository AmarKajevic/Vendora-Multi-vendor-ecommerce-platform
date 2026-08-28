import { StarEmpty, StarFilled, StarHalf } from 'apps/user-ui/src/assets/svgs/star';

import React from 'react'


type Props = {
    rating:number;
}


const Ratings = ({ rating }: Props) => {
  const stars = []

  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 !== 0

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<StarFilled key={`star-${i}`} />)
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<StarHalf key={`star-${i}`} />)
    } else {
      stars.push(<StarEmpty key={`star-${i}`} />)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {stars}
    </div>
  )
}


export default Ratings
