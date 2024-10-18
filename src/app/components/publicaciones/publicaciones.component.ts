import { Component, OnInit, NgModule} from '@angular/core';
import { FirebaseService } from '../../firebase/firebase.service';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';




@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: 
  [
    FormsModule,
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,

  ],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css'
})
export class PublicacionesComponent implements OnInit{

  chart: any;

  categories = [
    {
      nombre: 'Idiomas y Comunicación',
      subcategorias: ['Traducción e Interpretación', 'Comunicación Digital y Multimedia']
    },
    {
      nombre: 'Administración y Negocios',
      subcategorias: ['Administración de Empresas', 'Contabilidad y Auditoría', 'Marketing']
    },
    {
      nombre: 'Diseño y Arte',
      subcategorias: ['Diseño Gráfico', 'Diseño de Videojuegos', 'Producción Audiovisual']
    },
    {
      nombre: 'Informática',
      subcategorias: ['Desarrollo de Software', 'Inteligencia Artificial y Machine Learning', 'Ciberseguridad', 'Bases de Datos', 'Redes y Telecomunicaciones', 'DevOps y Cloud Computing', 'Desarrollo de Videojuegos', 'Internet de las Cosas (IoT)', 'Automatización y Robótica', 'Tecnologías Emergentes']
    },
    {
      nombre: 'Salud y Ciencias Sociales',
      subcategorias: ['Técnico en Enfermería', 'Terapia Ocupacional', 'Educación Parvularia']
    }
  ];

  selectedCategory = this.categories[0].nombre;
  selectedSubcategory = this.categories[0].subcategorias[0];
  noDataMessage = '';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
  }
 
  loadChartData(category: string, subcategory: string): void {
    this.firebaseService.getPublicationsByCategoryAndSubcategory(category, subcategory).subscribe(publications => {
      if (publications.length === 0) {
        this.noDataMessage = `No hay publicaciones disponibles para la combinación de ${category} y ${subcategory}.`;
        if (this.chart) {
          this.chart.destroy();
        }
      } else {
        this.noDataMessage = ''; // Limpiar mensaje si hay datos
        const chartData = this.prepareChartData(publications);
        this.createChart(chartData);
      }
    });
  }

  prepareChartData(publications: any[]): any {
    const groupedData = publications.reduce((acc, pub) => {
      const [day, month, year] = pub.fecha_ayudantia.split('-');
      const formattedMonth = `${year}-${month.padStart(2, '0')}`;
      acc[formattedMonth] = (acc[formattedMonth] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(groupedData).sort();
    const data = labels.map(label => groupedData[label]);

    return { labels, data };
  }

  createChart(chartData: any): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const ctx = document.getElementById('publicationChart') as HTMLCanvasElement;
  
      if (ctx) {
        if (this.chart) {
          this.chart.destroy();
        }
  
        this.chart = new Chart(ctx, {
          type: 'bar', // Cambia a 'line' si prefieres una gráfica de líneas
          data: {
            labels: chartData.labels,
            datasets: [{
              label: `Publicaciones en ${this.selectedCategory} - ${this.selectedSubcategory}`,
              data: chartData.data,
              backgroundColor: 'rgba(63, 81, 181, 0.5)', // Color del gráfico
              borderColor: 'rgba(63, 81, 181, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false
                },
                title: {
                  display: true,
                  text: 'Meses'
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Cantidad de Publicaciones'
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            }
          }
        });
      }
    }
  }
  
  // Método que devuelve las subcategorías de la categoría seleccionada
  getSubcategories(): string[] {
    const category = this.categories.find(cat => cat.nombre === this.selectedCategory);
    return category ? category.subcategorias : [];
  }

  onCategoryChange(event: MatSelectChange): void {
    this.selectedCategory = event.value;
    this.selectedSubcategory = this.getSubcategories()[0];
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
  }

  onSubcategoryChange(event: MatSelectChange): void {
    this.selectedSubcategory = event.value;
    this.loadChartData(this.selectedCategory, this.selectedSubcategory);
  }

}
