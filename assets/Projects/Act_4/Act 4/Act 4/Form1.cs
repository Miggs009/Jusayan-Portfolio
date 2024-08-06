using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Act_4
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            intiDesc();
            initPicBox();
            reColorPic();
            
            //hidePic();

        }
        PictureBox[] pic = new PictureBox[10];
        Label[] label = new Label[10];
        Random ran = new Random();
        void initPicBox()
        {
            int x = 10;
            int y = 10;
            for(int i = 0; i < 10; i++)
            {
                pic[i] = new PictureBox();     
                panel1.Controls.Add(pic[i]);
                //pic[i].BackColor = Color.FromArgb(255,ran.Next(1,255), ran.Next(1, 255));
                pic[i].BackColor = Color.White;
                pic[i].SetBounds(x, y, 50, 50);
               

                label[i] = new Label();
                panel1.Controls.Add(label[i]);
                label[i].Text = desc[i];
                label[i].SetBounds(x+60, y, 1000, 20);
                y += 60;

            }
        }

        Color[] col = new Color[10];
        void reColorPic()
        {
            col[0] = Color.Red;
            col[1] = Color.Blue;
            col[2] = Color.Yellow;
            col[3] = Color.Purple;
            col[4] = Color.Indigo;
            col[5] = Color.BlueViolet;
            col[6] = Color.Brown;
            col[7] = Color.Orange;
            col[8] = Color.Violet;
            col[9] = Color.DarkCyan;
            
            for(int i = 0; i <10;i++)
            {
                pic[i].BackColor = col[i];
            }
        }
        String[] desc = new string[10];
        void intiDesc()
        {
            desc[0] = "shoes";
            desc[1] = "socks";
            desc[2] = "dress";
            desc[3] = "shirt";
            desc[4] = "polo";
            desc[5] = "underwear";
            desc[6] = "towel";
            desc[7] = "earings";
            desc[8] = "clip";
            desc[9] = "chair";
        }

        private void textBox1_TextChanged(object sender, EventArgs e)
        {
            String search = textBox1.Text;

            int picIndex = 0;
            hidePic();
            for(int i = 0; i < 10; i++)
            {

                if(desc[i].Contains(search))
                {
                    pic[picIndex].BackColor = col[i];
                    label[picIndex].Text = desc[i]; 
                    pic[picIndex].Visible = true;
                    label[picIndex].Visible = true;
                    picIndex++;
                    
                }
            }
        }
        void hidePic()
        {
            for(int i = 0; i < 10; i++)
            {
                pic[i].Visible = false;
                label[i].Visible = false;
            }
        }
    }
}
