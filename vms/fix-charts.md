# Chart fixes needed

Line 1344-1348: Replace ResponsiveContainer with fixed width/height with direct chart

Current:
```
<ResponsiveContainer width={64} height={24} minWidth={0} minHeight={0}>
  <LineChart data={zone.data.map((v, i) => ({ i, v }))}>
    <Line type="monotone" dataKey="v" stroke="#00775B" strokeWidth={1} dot={false} isAnimationActive={false} />
  </LineChart>
</ResponsiveContainer>
```

Should be:
```
<LineChart width={64} height={24} data={zone.data.map((v, i) => ({ i, v }))}>
  <Line type="monotone" dataKey="v" stroke="#00775B" strokeWidth={1} dot={false} isAnimationActive={false} />
</LineChart>
```
