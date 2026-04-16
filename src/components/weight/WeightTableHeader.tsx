import React from 'react';

interface WeightTableHeaderProps {
  isImperial: boolean;
  showActions: boolean;
  hasBmi: boolean;
  hasBodyFat: boolean;
  hasMuscle: boolean;
  hasBone: boolean;
  hasWater: boolean;
}

const thClass =
  'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider';

const WeightTableHeader: React.FC<WeightTableHeaderProps> = ({
  isImperial,
  showActions,
  hasBmi,
  hasBodyFat,
  hasMuscle,
  hasBone,
  hasWater,
}) => {
  return (
    <thead className="bg-muted/40">
      <tr>
        <th scope="col" className={thClass}>Date</th>
        <th scope="col" className={thClass}>Weight ({isImperial ? 'lbs' : 'kg'})</th>
        <th scope="col" className={thClass}>Δ</th>
        {hasBmi && <th scope="col" className={thClass}>BMI</th>}
        {hasBodyFat && <th scope="col" className={thClass}>Body Fat</th>}
        {hasMuscle && <th scope="col" className={thClass}>Muscle ({isImperial ? 'lbs' : 'kg'})</th>}
        {hasBone && <th scope="col" className={thClass}>Bone ({isImperial ? 'lbs' : 'kg'})</th>}
        {hasWater && <th scope="col" className={thClass}>Water</th>}
        {showActions && <th scope="col" className={thClass}>Actions</th>}
      </tr>
    </thead>
  );
};

export default WeightTableHeader;
