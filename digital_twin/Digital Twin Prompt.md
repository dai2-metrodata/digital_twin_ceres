Build a digital twin for a Unisign Dual Rail machine to manufacturing Rails for Industrial customers, the digital twin of the machine should look like the image attached. The Key KPI’s for calculation,

Key Equipment KPIs
	•	Overall Equipment Effectiveness (OEE): Measures how much time is truly productive. It is calculated as:\(\text{OEE}=\text{Availability}\times \text{Performance}\times \text{Quality}\)
	•	Availability Rate: Tracks machine uptime. It measures actual run-time versus planned production time. High availability proves that the dual rails and tool changers work smoothly.
	•	Performance Rate: Measures speed. It compares the number of parts made versus the maximum possible speed for those parts.
	•	Quality Rate: Tracks waste. It is the number of good parts divided by the total parts produced.  

Dual-Rail Mechanical KPIs
	•	Rail Accuracy / Straightness: Measures the physical wear on the dual rail system over time. A machine laser test keeps tolerances tight.
	•	Vibration Frequency (Resonance): Tracks machine shaking. High vibration on dual rails causes bad part finishes.
	•	Axis Positioning Error: Measures how well the gantry lands at a specific spot.

Tooling & Maintenance KPIs
	•	Mean Time Between Failures (MTBF): Counts the average time in hours between machine breakdowns. A higher number means fewer surprises.
	•	Mean Time to Repair (MTTR): Counts how long it takes to fix a broken machine. A lower number gets the factory working again faster.
	•	Tool Life / Wear Rate: Tracks how many parts you can make before a drill or cutter breaks. This helps you order parts before they run out

The Key process parameters to control are - 

Core Process Parameters
Parameters differ based on the material (e.g., steel or cast iron). Typical operational parameters include:  
	•	Cutting Speed (\(v_{c}\)): The rate at which the material moves past the cutting edge. For example, deep-hole drilling of mild steel usually operates at 80 m/min.  
	•	Feed Rate (f): The speed at which the tool advances into the material. In milling, this can range from 5 mm/min to 32,000 mm/min depending on the operation.  
	•	Spindle Speed (RPM): Rotational speed. A high-rigidity spindle might rotate at 1,592 RPM for deep-hole drilling, or up to 4,000 RPM for rough milling.  
	•	Zero-Point Correction: Unisign machines feature three-dimensional zero-point correction to ensure precise positioning

Use WebGL format for constructing a digital twin of the machine and display the key process parameters and the KPI’s in context of the 3D rendering of the machine which looks like the image attached. Additionally build an interface to simulate what if scenarios for adjusting the process parameters and a prescribed quality for a certain rail length between 5 to 25 feet. Provide a view for Supply chain engineer who can simulate the digital twin against the daily work order and inventory availability for Rails and inbound transportation via trucks & trains getting the raw material to ensure there is no stock out situation at the plant due to delays in transportation getting raw materials or due to geo political issues prediction of material scarcity or running out of stock in ware houses due to higher volume of orders. Similar simulation for outbound transportation to ensure there is warehouse space to stock the finished goods if trucks and trains are delayed carrying the finished goods to destination and look for alternative ways to manage stock where needed.
Build this as react JS application.







