import { useEffect } from 'react';
import PaymentCalculator from '../components/widgets/PaymentCalculator.jsx';
import RentVsBuy from '../components/widgets/RentVsBuy.jsx';
import NeighborhoodMatch from '../components/widgets/NeighborhoodMatch.jsx';
import LocalNav from '../components/LocalNav.jsx';

export default function Tools() {
  useEffect(() => {
    document.title = 'Tools | Deva Kane';
  }, []);
  return (
    <div className="page page--lnav tools">
      <LocalNav
        title="Financial calculators"
        links={[{ id: 'payment', label: 'Payment' }, { id: 'rent-or-buy', label: 'Rent or buy' }, { id: 'match', label: 'Neighborhood' }]}
        cta={{ label: 'Ask Deva', to: '/contact' }}
      />
      <header className="page__head container">
        <h1>Calculators</h1>
        <p className="lede">Quick ways to run the numbers and narrow the search. Everything stays on your device.</p>
      </header>
      <section id="payment" className="container tool" aria-labelledby="t1">
        <h2 id="t1">Monthly payment</h2>
        <p>Principal, interest, tax, insurance, and HOA in one number.</p>
        <PaymentCalculator />
      </section>
      <section id="rent-or-buy" className="container tool" aria-labelledby="t2">
        <h2 id="t2">Rent or buy</h2>
        <p>Compare the total cost of each over the years you plan to stay.</p>
        <RentVsBuy />
      </section>
      <section id="match" className="container tool" aria-labelledby="t3">
        <h2 id="t3">Find your neighborhood</h2>
        <p>Four questions about how you like to live.</p>
        <NeighborhoodMatch />
      </section>
    </div>
  );
}
