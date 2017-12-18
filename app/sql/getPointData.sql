Select dh.hunt, dh.species, draw_rate, harvest_success_rate, residency, season, dh.legal_animal, full_unit,dh.description ,zoom.x,zoom.y,zoom.zoom
from hunt.draw_hunt dh
join hunt.species s on s.species = dh.species 
join hunt.legal_animal la on la.legal_animal = dh.legal_animal and la.species = dh.species
join hunt.zoom on zoom.hunt = dh.hunt

where st_contains(geom, st_transform(ST_SetSrid(ST_Point(?,?),4326),3338)) $whereClause$ order by hunt asc
