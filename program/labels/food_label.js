const nutritional_data = {
      "protein.": {"calories":165,"protein":30,"fat":3.6,"carbohydrates":0,"sodium":50},
      chicken: {"calories":165,"protein":30,"fat":3.6,"carbohydrates":0,"sodium":50},
      beef: {"calories":250,"protein":25,"fat":17,"carbohydrates":0,"sodium":48},
      salmon: {"calories":206,"protein":20,"fat":13,"carbohydrates":0,"sodium":76},
      tilapia: {"calories":128,"protein":26,"fat":2.7,"carbohydrates":0,"sodium":165},
      shrimp: {"calories":99,"protein":24,"fat":0.3,"carbohydrates":0.2,"sodium":300},
      pork: {"calories":188,"protein":21,"fat":13,"carbohydrates":0,"sodium":77},
      turkey: {"calories":169,"protein":29,"fat":6,"carbohydrates":0,"sodium":50},
      liver: {"calories":191,"protein":29,"fat":6.5,"carbohydrates":5,"sodium":72},
      bison: {"calories":214.2,"protein":18.7,"fat":15,"carbohydrates":0,"sodium":49},
      
      
      "carbs.": {"calories":71,"protein":2.1,"fat":0.2,"carbohydrates":18,"sodium":2},
      "sweet potato": {"calories":92,"protein":1.7,"fat":0.2,"carbohydrates":22,"sodium":36},
      potato: {"calories":71,"protein":2.1,"fat":0.2,"carbohydrates":18,"sodium":2},
      "red potato": {"calories":72,"protein":2,"fat":0.1,"carbohydrates":18,"sodium":20},
      "white rice": {"calories":355,"protein":2.2,"fat":0.7,"carbohydrates":31,"sodium":1},
      pasta: {"calories":340,"protein":17,"fat":2,"carbohydrates":68,"sodium":1},
      quinoa: {"calories":320,"protein":10,"fat":2,"carbohydrates":22,"sodium":30},
      cauliflower: {"calories":25,"protein":2,"fat":0.3,"carbohydrates":5,"sodium":15},
      "basmati rice": {"calories":129.8,"protein":2.7,"fat":0,"carbohydrates":28.5,"sodium":5},
      "brown rice": {"calories":111.2,"protein":2.3,"fat":0,"carbohydrates":23.5,"sodium":5},
      
      
      "veggies.": {"calories":35,"protein":3,"fat":0.4,"carbohydrates":6,"sodium":0},
      broccoli: {"calories":35,"protein":3,"fat":0.4,"carbohydrates":6,"sodium":0},
      zucchini: {"calories":18,"protein":1.2,"fat":0.4,"carbohydrates":4,"sodium":14},
      asparagus: {"calories":22,"protein":2.4,"fat":0,"carbohydrates":4,"sodium":4},
      brussels: {"calories":60,"protein":4.3,"fat":0.8,"carbohydrates":12,"sodium":25},
      spinach: {"calories":23,"protein":2.9,"fat":0.4,"carbohydrates":3.8,"sodium":74},
      cucumber: {"calories":16,"protein":0.6,"fat":0.1,"carbohydrates":2.9,"sodium":2},
      "green beans": {"calories":35,"protein":1.9,"fat":0.2,"carbohydrates":7.9,"sodium":1},
      cabbage: {"calories":25,"protein":1.3,"fat":0.1,"carbohydrates":5.8,"sodium":18},
      chard: {"calories":21,"protein":2,"fat":0.2,"carbohydrates":3,"sodium":4},
      kale: {"calories":28,"protein":1.9,"fat":0.4,"carbohydrates":5.6,"sodium":23},
      carrot: {"calories":35,"protein":0.8,"fat":0.2,"carbohydrates":8.2,"sodium":58},
      lettuce: { calories: 0, protein: 0, fat: 0, carbohydrates: 0, sodium: 0 },
      tomatoes: { calories: 0, protein: 0, fat: 0, carbohydrates: 0, sodium: 0 },
      mushrooms: { calories: 0, protein: 0, fat: 0, carbohydrates: 0, sodium: 0 },
      
      
      egg: {"calories":78,"protein":6.3,"fat":5.3,"carbohydrates":0.6,"sodium":62},
      avocado: {"calories":275,"protein":3.3,"fat":24.8,"carbohydrates":14.2,"sodium":13.2},
      salad: {"calories":17,"protein":0.3,"fat":0,"carbohydrates":3.3,"sodium":10},
      
      
      olive_oil: {"calories":44,"protein":0,"fat":5,"carbohydrates":0,"sodium":0},
      dressing: {"calories":21.5,"protein":0,"fat":5,"carbohydrates":0,"sodium":0}
    };

    const extra_items = new Set(["egg","avocado","salad"]);
    const sauce_items = new Set(["olive_oil","dressing"]);

    function calculate_label(ingredients){
      let total = {calories:0, protein:0, fat:0, carbohydrates:0, sodium:0};
      for(let key in ingredients){
        const data = ingredients[key];
        const name = data.name;
        const amount = data.amount;
        if(!name || amount <= 0) continue;
        if(extra_items.has(name) || sauce_items.has(name)){
          for(let k in total) total[k] += nutritional_data[name][k]*amount;
        } else {
          let factor = amount / 100;
          for(let k in total) total[k] += nutritional_data[name][k]*factor;
        }
      }
      for(let k in total) total[k] = Math.round(total[k]*100)/100;
      return total;
    }

    function format_amount(val){
      if(val === Math.floor(val)) return val.toString();
      return val.toFixed(2).replace(/\.?0+$/,"");
    }

    document.getElementById("nutritionForm").addEventListener("submit", function(e){
      e.preventDefault();
      const form = e.target;

      const ingredients = {
        protein: {name: form.protein.value, amount: parseFloat(form.protein_ounces.value||0)*28.35},
        carbohydrate: {name: form.carbohydrate.value, amount: parseFloat(form.carbohydrate_ounces.value||0)*28.35},
        vegetable: {name: form.vegetable.value, amount: parseFloat(form.vegetable_ounces.value||0)*28.35}
      };

      ["egg","avocado","salad"].forEach(extra=>{
        const checkbox = form.querySelector(`input[name="extra"][value="${extra}"]`);
        const countInput = form.querySelector(`input[name="extra_${extra}_count"]`);
        if(checkbox.checked && parseFloat(countInput.value||0) > 0){
          ingredients[`extra_${extra}`] = {name: extra, amount: parseFloat(countInput.value)};
        }
      });

      if(form.sauce.value && parseFloat(form.sauce_count.value||0)>0){
        ingredients['sauce'] = {name: form.sauce.value, amount: parseFloat(form.sauce_count.value)};
      }

      const label = calculate_label(ingredients);

      // Build summary exactly like Flask
      let summary=[];
      for(let key in ingredients){
        const data = ingredients[key];
        if(!data.name || data.amount<=0) continue;
        if(extra_items.has(data.name)){
          summary.push(`${data.name.charAt(0).toUpperCase()+data.name.slice(1)} ${format_amount(data.amount)}`);
        } else if(!sauce_items.has(data.name)){
          const ounces = data.amount/28.35;
          summary.push(`${data.name.charAt(0).toUpperCase()+data.name.slice(1)} ${format_amount(ounces)} oz`);
        }
      }

      // Render result
      document.getElementById("result").innerHTML = `
        <img src="logo.png" alt="Riversoljax Logo" style="width:1.3in;height:1.2in;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" />
        ${summary.length ? `<p style="font-size:12px;margin:8px 0 6px 0;text-align:left;"><strong>Meal:</strong> ${summary.join(", ")}</p>` : ""}
        <h2 style="font-size:14px;margin:6px 0 6px 0;text-align:left;">Nutrition Facts</h2>
        <p style="font-size:12px;margin:6px 0 0 0;text-align:left;"><strong>Calories:</strong> ${label.calories} kcal</p>
        <p style="font-size:12px;margin:2px 0 0 0;text-align:left;"><strong>Protein:</strong> ${label.protein} g</p>
        <p style="font-size:12px;margin:2px 0 0 0;text-align:left;"><strong>Fat:</strong> ${label.fat} g</p>
        <p style="font-size:12px;margin:2px 0 0 0;text-align:left;"><strong>Carbohydrates:</strong> ${label.carbohydrates} g</p>
        <p style="font-size:12px;margin:2px 0 0 0;text-align:left;"><strong>Sodium:</strong> ${label.sodium} mg</p>
      `;
    });